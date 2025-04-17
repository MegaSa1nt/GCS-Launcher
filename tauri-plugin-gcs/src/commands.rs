use tauri::{AppHandle, command, Runtime};

use crate::models::*;
use crate::Result;
use crate::GcsExt;

#[command]
pub(crate) async fn install<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.gcs().install(payload)
}

#[command]
pub(crate) async fn run<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.gcs().run(payload)
}

#[command]
pub(crate) async fn openInstallSettings<R: Runtime>(
    app: AppHandle<R>,
    payload: PingRequest,
) -> Result<PingResponse> {
    app.gcs().openInstallSettings(payload)
}