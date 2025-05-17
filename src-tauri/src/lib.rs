#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::path::Path;
use std::io::{Read, Seek};
use zip::read::ZipArchive;
use tauri::{AppHandle, Emitter};

async fn extract_zip<R: Read>(app: AppHandle, reader: R, output_dir: &str) -> Result<(), String> where R: Seek {
    let mut archive = ZipArchive::new(reader).expect("[1] Invalid ZIP file");
	
	let archive_length = archive.len();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).expect("[2] Invalid ZIP file");
		
		if !file.is_dir() {
			let output_path = format!("{}{}", output_dir, file.name());
			
			let parent_dir = Path::new(&output_path).parent().unwrap();
			if !parent_dir.exists() {
				std::fs::create_dir_all(parent_dir).expect("[7] Failed to create directory");
			}
			
			let output_file = File::create(&output_path).expect(&format!("[3] Invalid path: {}", &output_path));

			let mut writer = std::io::BufWriter::new(output_file);
			std::io::copy(&mut file, &mut writer).expect("[4] No permissions");
			
			app.emit("fileExtract", format!("{:?}|{:?}", i + 1, archive_length)).unwrap();
		}
    }
    
    Ok(())
}

#[tauri::command]
async fn extract_archive(app: AppHandle, archive_path: String, output_path: String) -> Result<(), String> {
	let archive_reader = File::open(&archive_path).expect("[5] Invalid ZIP file");
	
	let _ = extract_zip(app, archive_reader, &output_path).await.expect("[6] Invalid ZIP file or no permissions");
	
	Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_gcs::init())
		.plugin(tauri_plugin_download::init())
		.invoke_handler(tauri::generate_handler![extract_archive])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
