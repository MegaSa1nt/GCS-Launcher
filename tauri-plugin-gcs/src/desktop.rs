use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<Gcs<R>> {
  Ok(Gcs(app.clone()))
}

/// Access to the gcs APIs.
pub struct Gcs<R: Runtime>(AppHandle<R>);

impl<R: Runtime> Gcs<R> {
  pub fn install(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    Ok(PingResponse {
      value: payload.value,
    })
  }
}

impl<R: Runtime> Gcs<R> {
  pub fn run(&self, payload: PingRequest) -> crate::Result<PingResponse> {
    Ok(PingResponse {
      value: payload.value,
    })
  }
}
