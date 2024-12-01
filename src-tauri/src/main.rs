// Prevents additional console window on Windows in release, DO NOT Rpub(crate)EMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use commands::{fetch_statuspage_data, get_application_name, get_version};
use models::{ApiResponse, CustomError};
use tauri_plugin_updater::UpdaterExt;

mod api_action;
mod commands;
mod models;

impl serde::Serialize for CustomError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = update(handle).await {
                    println!("Failed to update: {e}");
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_version,
            get_application_name,
            fetch_statuspage_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    if let Some(content_length) = content_length {
                        let percentage = (downloaded as f64 / content_length as f64) * 100.0;
                        println!(
                            "downloaded {} bytes from {} bytes ({:.2}%)",
                            downloaded, content_length, percentage
                        );
                    } else {
                        println!("downloaded {} bytes (unknown total size)", downloaded);
                    }
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }
    Ok(())
}
