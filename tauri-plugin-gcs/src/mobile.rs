use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_gcs);

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<Gcs<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin("sa1nt.gcs", "GCSPlugin")?;
  #[cfg(target_os = "ios")]
  let handle = api.register_ios_plugin(init_plugin_gcs)?;
  Ok(Gcs(handle))
}

/// Access to the gcs APIs.
pub struct Gcs<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> Gcs<R> {
  pub fn install(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    self
      .0
      .run_mobile_plugin("install", payload)
      .map_err(Into::into)
  }
  pub fn run(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    self
      .0
      .run_mobile_plugin("run", payload)
      .map_err(Into::into)
  }
}
