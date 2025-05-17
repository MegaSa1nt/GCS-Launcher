use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::Gcs;
#[cfg(mobile)]
use mobile::Gcs;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the gcs APIs.
pub trait GcsExt<R: Runtime> {
  fn gcs(&self) -> &Gcs<R>;
}

impl<R: Runtime, T: Manager<R>> crate::GcsExt<R> for T {
  fn gcs(&self) -> &Gcs<R> {
    self.state::<Gcs<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("gcs")
    .invoke_handler(tauri::generate_handler![commands::install, commands::run])
    .setup(|app, api| {
      #[cfg(mobile)]
      let gcs = mobile::init(app, api)?;
      #[cfg(desktop)]
      let gcs = desktop::init(app, api)?;
      app.manage(gcs);
      Ok(())
    })
    .build()
}