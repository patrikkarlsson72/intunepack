use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct OperationResult {
    pub status: String,
    pub message: String,
    pub progress: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProgressUpdate {
    pub progress: u8,
    pub message: String,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VersionInfo {
    pub app_version: String,
    pub tauri_version: String,
    pub rust_version: String,
    pub platform: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_version_info() -> VersionInfo {
    VersionInfo {
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        tauri_version: tauri::VERSION.to_string(),
        rust_version: std::env::var("RUSTC_SEMVER").unwrap_or_else(|_| "Unknown".to_string()),
        platform: std::env::consts::OS.to_string(),
    }
}

#[tauri::command]
async fn open_url(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

#[tauri::command]
async fn extract_intunewin(
    app: AppHandle,
    file_path: String,
    output_dir: String,
) -> Result<OperationResult, String> {
    // Emit initial progress
    let progress_update = ProgressUpdate {
        progress: 0,
        message: "Starting extraction...".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    app.emit("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    // Get the path to the decoder executable
    let decoder_path = get_decoder_path(&app)?;
    
    // Validate input file exists
    if !std::path::Path::new(&file_path).exists() {
        return Err("Input file does not exist".to_string());
    }

    // Create output directory if it doesn't exist
    if let Err(e) = std::fs::create_dir_all(&output_dir) {
        return Err(format!("Failed to create output directory: {}", e));
    }

    // Emit progress update
    let progress_update = ProgressUpdate {
        progress: 25,
        message: "Running decoder...".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    app.emit("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    // Execute the decoder with stdin redirected to avoid console input issues
    let output = Command::new(&decoder_path)
        .arg(&file_path)
        .arg(&output_dir)
        .stdin(std::process::Stdio::null()) // Redirect stdin to avoid console input issues
        .output()
        .map_err(|e| format!("Failed to execute decoder: {}", e))?;

    // Check if extraction was successful before emitting progress
    let output_path = std::path::Path::new(&output_dir);
    let has_zip_file = output_path.read_dir()
        .map(|entries| entries.filter_map(|e| e.ok())
            .any(|entry| {
                let path = entry.path();
                path.is_file() && path.extension().map_or(false, |ext| ext == "zip")
            }))
        .unwrap_or(false);
    
    let has_extracted_folder = output_path.join("extracted").is_dir();
    let extraction_successful = output.status.success() || has_zip_file || has_extracted_folder;
    
    // Emit completion progress
    let progress_update = ProgressUpdate {
        progress: 100,
        message: if extraction_successful {
            "Extraction completed successfully".to_string()
        } else {
            "Extraction failed".to_string()
        },
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    app.emit("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    // Use the already computed values for the final result
    if extraction_successful {
        Ok(OperationResult {
            status: "success".to_string(),
            message: if has_zip_file || has_extracted_folder {
                "Package extracted successfully".to_string()
            } else {
                "Extraction completed (check output directory)".to_string()
            },
            progress: 100,
        })
    } else {
        // Log both stdout and stderr for debugging
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);
        let error_details = if !stdout.is_empty() && !stderr.is_empty() {
            format!("Decoder failed:\nSTDOUT: {}\nSTDERR: {}", stdout, stderr)
        } else if !stderr.is_empty() {
            format!("Decoder failed: {}", stderr)
        } else if !stdout.is_empty() {
            format!("Decoder failed: {}", stdout)
        } else {
            "Decoder failed with no output".to_string()
        };
        Err(error_details)
    }
}

#[tauri::command]
async fn create_intunewin(
    app: AppHandle,
    setup_folder: String,
    setup_file: String,
    output_folder: String,
) -> Result<OperationResult, String> {
    // Emit initial progress
    let progress_update = ProgressUpdate {
        progress: 0,
        message: "Starting package creation...".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    app.emit("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    // Get the path to the IntuneWinAppUtil executable
    let util_path = get_util_path(&app)?;
    
    // Validate setup folder exists
    if !std::path::Path::new(&setup_folder).exists() {
        return Err("Setup folder does not exist".to_string());
    }

    // Validate setup file exists
    let setup_file_path = std::path::Path::new(&setup_folder).join(&setup_file);
    if !setup_file_path.exists() {
        return Err(format!("Setup file '{}' not found in folder '{}'", setup_file, setup_folder));
    }

    // Create output directory if it doesn't exist
    if let Err(e) = std::fs::create_dir_all(&output_folder) {
        return Err(format!("Failed to create output directory: {}", e));
    }

    // Emit progress update
    let progress_update = ProgressUpdate {
        progress: 25,
        message: "Running IntuneWinAppUtil...".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    app.emit("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    // Build the command with correct parameters
    // IntuneWinAppUtil -c <setup_folder> -s <source_setup_file> -o <output_folder> -q
    let output = Command::new(&util_path)
        .arg("-c")
        .arg(&setup_folder)
        .arg("-s")
        .arg(&setup_file)
        .arg("-o")
        .arg(&output_folder)
        .arg("-q") // Quiet mode to avoid interactive prompts
        .output()
        .map_err(|e| format!("Failed to execute IntuneWinAppUtil: {}", e))?;

    // Check if the output file was actually created
    // IntuneWinAppUtil creates the file with the setup file name + .intunewin extension
    let setup_file_base = setup_file.replace(".exe", "").replace(".msi", ""); // Remove common extensions
    let expected_output_file = std::path::Path::new(&output_folder).join(format!("{}.intunewin", setup_file_base));
    let file_created = expected_output_file.exists();

    // Also check for any .intunewin files in the output directory as fallback
    let mut any_intunewin_found = false;
    if !file_created {
        if let Ok(entries) = std::fs::read_dir(&output_folder) {
            any_intunewin_found = entries
                .filter_map(|e| e.ok())
                .any(|entry| {
                    let path = entry.path();
                    path.is_file() && path.extension().map_or(false, |ext| ext == "intunewin")
                });
        }
    }

    let success = output.status.success() && (file_created || any_intunewin_found);

    // Emit completion progress
    let progress_update = ProgressUpdate {
        progress: 100,
        message: if success {
            "Package created successfully".to_string()
        } else {
            "Package creation failed".to_string()
        },
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    app.emit("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    if success {
        let final_message = if file_created {
            format!("Package created successfully: {}", expected_output_file.display())
        } else {
            "Package created successfully (check output folder for .intunewin file)".to_string()
        };
        
        Ok(OperationResult {
            status: "success".to_string(),
            message: final_message,
            progress: 100,
        })
    } else {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);
        let error_details = if !stdout.is_empty() && !stderr.is_empty() {
            format!("IntuneWinAppUtil failed:\nSTDOUT: {}\nSTDERR: {}", stdout, stderr)
        } else if !stderr.is_empty() {
            format!("IntuneWinAppUtil failed: {}", stderr)
        } else if !stdout.is_empty() {
            format!("IntuneWinAppUtil failed: {}", stdout)
        } else {
            "IntuneWinAppUtil failed with no output".to_string()
        };
        Err(error_details)
    }
}

fn get_decoder_path(app: &AppHandle) -> Result<PathBuf, String> {
    // Try to get the bundled resource path first
    if let Ok(resource_path) = app.path().resource_dir() {
        let bundled_path = resource_path.join("bin/IntuneWinAppUtilDecoder.exe");
        if bundled_path.exists() {
            return Ok(bundled_path);
        }
    }
    
    // Try the executable directory (where the app is running from)
    if let Ok(exe_dir) = app.path().executable_dir() {
        let exe_path = exe_dir.join("bin/IntuneWinAppUtilDecoder.exe");
        if exe_path.exists() {
            return Ok(exe_path);
        }
    }
    
    // Fallback to development paths
    let possible_paths = vec![
        PathBuf::from("src-tauri/bin/IntuneWinAppUtilDecoder.exe"),
        PathBuf::from("bin/IntuneWinAppUtilDecoder.exe"),
        PathBuf::from("IntuneWinAppUtilDecoder.exe"),
    ];
    
    for path in possible_paths {
        if path.exists() {
            return Ok(path);
        }
    }
    
    Err("IntuneWinAppUtilDecoder.exe not found. Please download it from the Microsoft Intune Win32 Content Prep Tool and place it in the bin directory.".to_string())
}

fn get_util_path(app: &AppHandle) -> Result<PathBuf, String> {
    // Try to get the bundled resource path first
    if let Ok(resource_path) = app.path().resource_dir() {
        let bundled_path = resource_path.join("bin/IntuneWinAppUtil.exe");
        if bundled_path.exists() {
            return Ok(bundled_path);
        }
    }
    
    // Try the executable directory (where the app is running from)
    if let Ok(exe_dir) = app.path().executable_dir() {
        let exe_path = exe_dir.join("bin/IntuneWinAppUtil.exe");
        if exe_path.exists() {
            return Ok(exe_path);
        }
    }
    
    // Fallback to development paths
    let possible_paths = vec![
        PathBuf::from("src-tauri/bin/IntuneWinAppUtil.exe"),
        PathBuf::from("bin/IntuneWinAppUtil.exe"),
        PathBuf::from("IntuneWinAppUtil.exe"),
    ];
    
    for path in possible_paths {
        if path.exists() {
            return Ok(path);
        }
    }
    
    Err("IntuneWinAppUtil.exe not found. Please download it from the Microsoft Intune Win32 Content Prep Tool and place it in the bin directory.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_version_info,
            open_url,
            extract_intunewin,
            create_intunewin
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
