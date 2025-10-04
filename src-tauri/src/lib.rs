use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Emitter};

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

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
    let decoder_path = get_decoder_path()?;
    
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
    input_path: String,
    output_dir: String,
    setup_file: Option<String>,
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
    let util_path = get_util_path()?;
    
    // Validate input path exists
    if !std::path::Path::new(&input_path).exists() {
        return Err("Input path does not exist".to_string());
    }

    // Create output directory if it doesn't exist
    if let Err(e) = std::fs::create_dir_all(&output_dir) {
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

    // Build the command
    let mut cmd = Command::new(&util_path);
    cmd.arg(&input_path);
    cmd.arg(&output_dir);
    
    // Add setup file if provided
    if let Some(setup) = setup_file {
        cmd.arg("-s").arg(&setup);
    }

    // Execute the utility
    let output = cmd
        .output()
        .map_err(|e| format!("Failed to execute IntuneWinAppUtil: {}", e))?;

    // Emit completion progress
    let progress_update = ProgressUpdate {
        progress: 100,
        message: if output.status.success() {
            "Package created successfully".to_string()
        } else {
            "Package creation failed".to_string()
        },
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    app.emit("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(OperationResult {
            status: "success".to_string(),
            message: "Package created successfully".to_string(),
            progress: 100,
        })
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        Err(format!("IntuneWinAppUtil failed: {}", error_message))
    }
}

fn get_decoder_path() -> Result<PathBuf, String> {
    // Try multiple possible locations for the decoder
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

fn get_util_path() -> Result<PathBuf, String> {
    // Try multiple possible locations for the utility
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
            extract_intunewin,
            create_intunewin
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
