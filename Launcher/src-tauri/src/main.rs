#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::OpenOptions;
use std::io::Write;
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, SystemTrayMenuItem};
use tauri::Manager;
use sysinfo::{System, SystemExt};

#[tauri::command]
fn append_chunk_to_file(path: String, chunk: Vec<u8>) -> Result<(), String> {
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    file.write_all(&chunk).map_err(|e| e.to_string())?;
    Ok(())
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
	let quit = CustomMenuItem::new("open".to_string(), "Открыть");
	let hide = CustomMenuItem::new("quit".to_string(), "Закрыть");
	let tray_menu = SystemTrayMenu::new()
	  .add_item(quit)
	  .add_native_item(SystemTrayMenuItem::Separator)
	  .add_item(hide);
	let tray = SystemTray::new().with_menu(tray_menu);
	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![append_chunk_to_file, check_processes])
		.system_tray(tray)
		.on_system_tray_event(|app, event| match event {
			SystemTrayEvent::LeftClick {
				position: _,
				size: _,
				..
			  } => {
				let window = app.get_window("main").unwrap();
				window.show().unwrap();
				window.unminimize().unwrap();
				window.set_focus().unwrap();
			  }
		  SystemTrayEvent::MenuItemClick { id, .. } => {
			match id.as_str() {
			  "quit" => {
				std::process::exit(0);
			  }
			  "open" => {
				let window = app.get_window("main").unwrap();
				window.show().unwrap();
				window.unminimize().unwrap();
				window.set_focus().unwrap();
			  }
			  _ => {}
			}
		  }
		  _ => {}
		})
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}