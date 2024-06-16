// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde;
use thiserror;
use reqwest;
use reqwest::Error as ReqwestError;

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_application_name() -> String {
    env!("CARGO_PKG_NAME").to_string()
}

#[derive(Debug, thiserror::Error)]
enum CustomError {
    #[error("Request failed: {0}")]
    Reqwest(#[from] ReqwestError),
    #[error("Invalid action: {0}")]
    InvalidAction(String),
}

impl serde::Serialize for CustomError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug)]
enum ApiAction {
    Summary,
    Status,
    Components,
    UnresolvedIncidents,
    AllIncidents,
    UpcomingMaintenances,
    ActiveMaintenances,
    AllMaintenances,
}

impl ApiAction {
    fn from_str(action: &str) -> Result<Self, CustomError> {
        match action {
            "summary" => Ok(ApiAction::Summary),
            "status" => Ok(ApiAction::Status),
            "components" => Ok(ApiAction::Components),
            "unresolved_incidents" => Ok(ApiAction::UnresolvedIncidents),
            "all_incidents" => Ok(ApiAction::AllIncidents),
            "upcoming_maintenances" => Ok(ApiAction::UpcomingMaintenances),
            "active_maintenances" => Ok(ApiAction::ActiveMaintenances),
            "all_maintenances" => Ok(ApiAction::AllMaintenances),
            _ => Err(CustomError::InvalidAction(action.to_string())),
        }
    }

    fn to_url(&self, page_id: &str) -> String {
        match self {
            ApiAction::Summary => format!("https://{}.statuspage.io/api/v2/summary.json", page_id),
            ApiAction::Status => format!("https://{}.statuspage.io/api/v2/status.json", page_id),
            ApiAction::Components => format!("https://{}.statuspage.io/api/v2/components.json", page_id),
            ApiAction::UnresolvedIncidents => format!("https://{}.statuspage.io/api/v2/incidents/unresolved.json", page_id),
            ApiAction::AllIncidents => format!("https://{}.statuspage.io/api/v2/incidents.json", page_id),
            ApiAction::UpcomingMaintenances => format!("https://{}.statuspage.io/api/v2/scheduled-maintenances/upcoming.json", page_id),
            ApiAction::ActiveMaintenances => format!("https://{}.statuspage.io/api/v2/scheduled-maintenances/active.json", page_id),
            ApiAction::AllMaintenances => format!("https://{}.statuspage.io/api/v2/scheduled-maintenances.json", page_id),
        }
    }
}

#[derive(serde::Deserialize, serde::Serialize, Debug)]
struct ApiResponse {
    status: Option<String>,
    message: Option<String>,
}

#[tauri::command]
async fn fetch_statuspage_data(page_id: String, action: String) -> Result<ApiResponse, CustomError> {
    let api_action = ApiAction::from_str(&action)?;
    let url = api_action.to_url(&page_id);
    let client = reqwest::Client::new();
    let response = client.get(&url).send().await?;
    let data = response.json::<ApiResponse>().await?;
    Ok(data)
}

fn main() {
    let _ = fix_path_env::fix();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_version, get_application_name, fetch_statuspage_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}