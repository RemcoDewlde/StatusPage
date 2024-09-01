use std::env;
use reqwest::{Client};
use crate::{ApiAction, ApiResponse, CustomError};

#[tauri::command]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub fn get_application_name() -> String {
    env!("CARGO_PKG_NAME").to_string()
}

#[tauri::command]
pub async fn fetch_statuspage_data(page_id: String, action: String) -> Result<ApiResponse, CustomError> {
    let api_action = ApiAction::from_str(&action)?;
    let url = api_action.to_url(&page_id);
    let client = build_client()?;
    let response = client.get(&url).send().await?;
    let data = response.json::<ApiResponse>().await?;
    Ok(data)
}

fn build_client() -> Result<Client, CustomError> {
    let client = if env::var("TAURI_ENV").unwrap_or_else(|_| "production".to_string()) == "development" {
        Client::builder()
            .danger_accept_invalid_certs(true) // Ignore SSL certificate errors
            .proxy(reqwest::Proxy::https("http://localhost:9090")?) // Proxy to Proxyman
            .build()?
    } else {
        Client::builder().build()?
    };

    Ok(client)
}