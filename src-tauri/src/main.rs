#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::ffi::OsStr;
use std::fs::File;
use std::io::{Read, Seek};
use std::path::Path;
use zip::read::ZipArchive;

use sysinfo::System;

use tauri::Manager;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri::{AppHandle, Emitter};

use futures_lite::StreamExt as _;
use mundy::{Interest, Preferences};

async fn extract_zip<R: Read>(app: AppHandle, reader: R, output_dir: &str) -> Result<(), String>
where
    R: Seek,
{
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

            let output_file =
                File::create(&output_path).expect(&format!("[3] Invalid path: {}", &output_path));

            let mut writer = std::io::BufWriter::new(output_file);
            std::io::copy(&mut file, &mut writer).expect("[4] No permissions");

            app.emit("fileExtract", format!("{:?}|{:?}", i + 1, archive_length))
                .unwrap();
        }
    }

    Ok(())
}

#[tauri::command]
async fn extract_archive(
    app: AppHandle,
    archive_path: String,
    output_path: String,
) -> Result<(), String> {
    let archive_reader = File::open(&archive_path).expect("[5] Invalid ZIP file");

    let _ = extract_zip(app, archive_reader, &output_path)
        .await
        .expect("[6] Invalid ZIP file or no permissions");

    Ok(())
}

#[tauri::command]
async fn check_processes(process: String) -> Result<(), String> {
    let s = System::new_all();
    let os_str = OsStr::new(&process);
    for _process in s.processes_by_exact_name(&os_str) {
        return Ok(());
    }
    return Err("No process with that name was found".to_string());
}

#[tauri::command]
async fn track_accent_color(app: AppHandle) -> Result<(), ()> {
    let mut stream = Preferences::stream(Interest::AccentColor);
    while let Some(preferences) = stream.next().await {
        app.emit(
            "accentColorChange",
            format!(
                "{:?}|{:?}|{:?}",
                preferences.accent_color.0.unwrap().red,
                preferences.accent_color.0.unwrap().green,
                preferences.accent_color.0.unwrap().blue
            ),
        )
        .unwrap();
    }
    Ok(())
}

fn main() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init());
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let launcher_window = app.get_webview_window("main").expect("no main window");
            let _ = launcher_window.unminimize();
            let _ = launcher_window.show();
            let _ = launcher_window.set_focus();
        }));
    }
    builder
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_download::init())
        .invoke_handler(tauri::generate_handler![
            check_processes,
            extract_archive,
            track_accent_color
        ])
        .setup(|app| {
            let open =
                MenuItemBuilder::with_id("open".to_string(), "Развернуть лаунчер").build(app)?;
            let close =
                MenuItemBuilder::with_id("quit".to_string(), "Закрыть лаунчер").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&open, &close]).build()?;
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(tauri::image::Image::from_bytes(include_bytes!(
                    "..\\icons\\lil.ico"
                ))?)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "open" => {
                        if let Some(webview_window) = app.get_webview_window("main") {
                            let _ = webview_window.show();
                            let _ = webview_window.unminimize();
                            let _ = webview_window.set_focus();
                        }
                    }
                    "quit" => {
                        std::process::exit(0);
                    }
                    _ => (),
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button,
                        button_state,
                        ..
                    } = event
                    {
                        if button_state == MouseButtonState::Up && button == MouseButton::Left {
                            let app = tray.app_handle();
                            if let Some(webview_window) = app.get_webview_window("main") {
                                let _ = webview_window.show();
                                let _ = webview_window.unminimize();
                                let _ = webview_window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
