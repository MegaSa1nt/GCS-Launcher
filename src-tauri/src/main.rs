#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::path::Path;
use std::io::Write;

#[tauri::command]
async fn download_file(url: String, temp_path: String) -> Result<(), String> {
    let response = reqwest::get(&url).await.expect("Failed downloading file");
    let body = response.bytes().await.expect("Failed downloading file");
    let path = Path::new(&temp_path);

    let file = match File::create(&path) {
        Err(why) => Err(why.to_string()),
        Ok(file) => Ok(file),
    };
    file?
        .write_all(&body.to_vec())
        .expect(&"Failed writing file".to_string());
    Ok(())
}

#[tauri::command]
async fn unpack_archive(archive_path: String, extract_path: String) -> Result<(), String> {
    sevenz_rust::decompress_file(&archive_path, &extract_path).expect("complete");
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
		.invoke_handler(tauri::generate_handler![
            download_file,
            unpack_archive
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
