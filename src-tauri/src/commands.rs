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
    let client = reqwest::Client::new();
    let response = client.get(&url).send().await?;
    let data = response.json::<ApiResponse>().await?;
    Ok(data)
}