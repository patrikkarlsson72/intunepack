use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Manager};

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
    app.emit_all("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    // Get the path to the decoder executable
    let decoder_path = get_decoder_path();
    
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
    app.emit_all("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    // Execute the decoder
    let output = Command::new(&decoder_path)
        .arg(&file_path)
        .arg(&output_dir)
        .output()
        .map_err(|e| format!("Failed to execute decoder: {}", e))?;

    // Emit completion progress
    let progress_update = ProgressUpdate {
        progress: 100,
        message: if output.status.success() {
            "Extraction completed successfully".to_string()
        } else {
            "Extraction failed".to_string()
        },
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    app.emit_all("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(OperationResult {
            status: "success".to_string(),
            message: "Package extracted successfully".to_string(),
            progress: 100,
        })
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        Err(format!("Decoder failed: {}", error_message))
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
    app.emit_all("progress-update", &progress_update)
        .map_err(|e| e.to_string())?;

    // Get the path to the IntuneWinAppUtil executable
    let util_path = get_util_path();
    
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
    app.emit_all("progress-update", &progress_update)
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
    app.emit_all("progress-update", &progress_update)
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

fn get_decoder_path() -> PathBuf {
    // In development, look for the decoder in the bin directory
    // In production, it will be bundled with the app
    if cfg!(debug_assertions) {
        PathBuf::from("src-tauri/bin/IntuneWinAppUtilDecoder.exe")
    } else {
        // In production, the executable will be in the same directory as the app
        PathBuf::from("IntuneWinAppUtilDecoder.exe")
    }
}

fn get_util_path() -> PathBuf {
    // In development, look for the utility in the bin directory
    // In production, it will be bundled with the app
    if cfg!(debug_assertions) {
        PathBuf::from("src-tauri/bin/IntuneWinAppUtil.exe")
    } else {
        // In production, the executable will be in the same directory as the app
        PathBuf::from("IntuneWinAppUtil.exe")
    }
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
