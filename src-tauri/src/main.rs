// Prevents additional console window on Windows in release, DO NOT Rpub(crate)EMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Deserialize, Serialize};
use thiserror::Error;
use reqwest;
use reqwest::Error as ReqwestError;

mod commands;

use commands::{get_version, get_application_name, fetch_statuspage_data};


#[derive(Debug, Error)]
enum CustomError {
    #[error("Request failed: {0}")]
    Reqwest(#[from] ReqwestError),
    #[error("Invalid action: {0}")]
    InvalidAction(String),
    #[error("General error: {0}")]
    General(String),
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

    fn to_url(&self, page_id: &String) -> String {
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

#[derive(Deserialize, Serialize, Debug)]
struct ApiResponse {
    page: Page,
    components: Option<Vec<Component>>,
    incidents: Option<Vec<Incident>>,
    scheduled_maintenances: Option<Vec<Maintenance>>,
    status: Option<Status>,
}

#[derive(Deserialize, Serialize, Debug)]
struct Page {
    id: String,
    name: String,
    url: String,
    time_zone: String,
    updated_at: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct Component {
    id: String,
    name: String,
    status: Option<String>,
    created_at: String,
    updated_at: String,
    position: i32,
    description: Option<String>,
    showcase: bool,
    start_date: Option<String>,
    group_id: Option<String>,
    page_id: String,
    group: bool,
    only_show_if_degraded: bool,
}

#[derive(Deserialize, Serialize, Debug)]
struct Incident {
    // Define fields based on the incident structure if present
}

#[derive(Deserialize, Serialize, Debug)]
struct Maintenance {
    // Define fields based on the maintenance structure if present
}

#[derive(Deserialize, Serialize, Debug)]
struct Status {
    indicator: String,
    description: Option<String>,
}

fn main() {
    let _ = fix_path_env::fix();
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_version, get_application_name, fetch_statuspage_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
