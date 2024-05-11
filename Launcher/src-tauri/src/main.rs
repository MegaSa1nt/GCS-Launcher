#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::OpenOptions;
use std::io::Write;
use sysinfo::{System, SystemExt};
use tauri::Manager;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{ClickType, TrayIconBuilder},
};
#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}

use std::io;
use std::path::Path;
use std::path::PathBuf;
use winreg::enums::*;
use winreg::RegKey;

fn change_gcs_version(ver: String) -> io::Result<()> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let path = Path::new("Software")
        .join("Microsoft")
        .join("Windows")
        .join("CurrentVersion")
        .join("Uninstall")
        .join("GCS-Client");
    let (key, _disp) = hkcu.create_subkey(&path)?;
    key.set_value("DisplayVersion", &ver)?;
    key.set_value("Publisher", &"MegaSa1nt")?;
    Ok(())
}

#[tauri::command]
fn cgcsv(ver: String) -> Result<(), String> {
    let _ = change_gcs_version(ver);
    Ok(())
}

#[tauri::command]
async fn append_chunk_to_file(
    request: tauri::ipc::Request<'_>,
) -> Result<(), String>  {
    if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
        let path = PathBuf::from(request.headers().get("path").unwrap().to_str().unwrap());
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)
            .map_err(|e| e.to_string())
            .unwrap();
        file.write_all(data).map_err(|e| e.to_string()).unwrap();
        Ok(())
    } else {
        return Err("No data was provided".to_string());
    }
}

#[tauri::command]
fn check_processes(process: String) -> Result<(), String> {
    let s = System::new_all();
    for _process in s.processes_by_exact_name(&process) {
        return Ok(());
    }
    return Err("No process with that name was found".to_string());
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
        }))
        .invoke_handler(tauri::generate_handler![
            append_chunk_to_file,
            check_processes,
            cgcsv
        ])
		.setup(|app| {
			let quit = MenuItemBuilder::with_id("open".to_string(), "Открыть лаунчер").build(app)?;
			let hide = MenuItemBuilder::with_id("quit".to_string(), "Закрыть лаунчер").build(app)?;
			let menu = MenuBuilder::new(app).items(&[&quit, &hide]).build()?;
			let _tray = TrayIconBuilder::new()
            .menu(&menu)
			.icon(tauri::image::Image::from_bytes(include_bytes!("..\\icons\\lil.ico"))?)
            .on_menu_event(move |app, event| match event.id().as_ref() {
                "open" => {
                    if let Some(webview_window) = app.get_webview_window("main") {
						let _ = webview_window.show();
						let _ = webview_window.unminimize();
						let _ = webview_window.set_focus();
                    }
                },
				"quit" => {
                    std::process::exit(0);
                },
                _ => (),
            })
            .on_tray_icon_event(|tray, event| {
                if event.click_type == ClickType::Left {
                    let app = tray.app_handle();
                    if let Some(webview_window) = app.get_webview_window("main") {
						let _ = webview_window.show();
						let _ = webview_window.unminimize();
						let _ = webview_window.set_focus();
                    }
                }
            })
            .build(app)?;

        Ok(())
		})
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
