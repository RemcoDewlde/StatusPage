// Prevents additional console window on Windows in release, DO NOT Rpub(crate)EMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use commands::{fetch_statuspage_data, get_application_name, get_version};
use models::{ApiResponse, CustomError};

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

fn main() {
    let _ = fix_path_env::fix();
    let mut builder = tauri::Builder::default();

    #[cfg(debug_assertions)]
    {
        let devtools = devtools::init();
        builder = builder.plugin(devtools)
    }

    builder
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_version,
            get_application_name,
            fetch_statuspage_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
