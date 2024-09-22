use reqwest::Error as ReqwestError;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug)]
pub enum ApiAction {
    Summary,
    Status,
    Components,
    UnresolvedIncidents,
    AllIncidents,
    UpcomingMaintenances,
    ActiveMaintenances,
    AllMaintenances,
}

#[derive(Debug, Error)]
pub enum CustomError {
    #[error("Request failed: {0}")]
    Reqwest(#[from] ReqwestError),
    #[error("Invalid action: {0}")]
    InvalidAction(String),
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ApiResponse {
    pub page: Page,
    pub components: Option<Vec<Component>>,
    pub incidents: Option<Vec<Incident>>,
    pub scheduled_maintenances: Option<Vec<Maintenance>>,
    pub status: Option<Status>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Page {
    pub id: String,
    pub name: String,
    pub url: String,
    pub time_zone: String,
    pub updated_at: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Component {
    pub id: String,
    pub name: String,
    pub status: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub position: i32,
    pub description: Option<String>,
    pub showcase: bool,
    pub start_date: Option<String>,
    pub group_id: Option<String>,
    pub page_id: String,
    pub group: bool,
    pub only_show_if_degraded: bool,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Incident {
    pub created_at: String,
    pub id: String,
    pub impact: String,
    pub incident_updates: Vec<IncidentUpdate>,
    pub monitoring_at: Option<String>,
    pub name: String,
    pub page_id: String,
    pub resolved_at: Option<String>,
    pub shortlink: String,
    pub status: String,
    pub updated_at: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct IncidentUpdate {
    pub body: String,
    pub created_at: String,
    pub display_at: String,
    pub id: String,
    pub incident_id: String,
    pub status: String,
    pub updated_at: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Maintenance {
    pub created_at: String,
    pub id: String,
    pub impact: String,
    pub incident_updates: Vec<MaintenanceUpdate>,
    pub monitoring_at: Option<String>,
    pub name: String,
    pub page_id: String,
    pub resolved_at: Option<String>,
    pub scheduled_for: String,
    pub scheduled_until: String,
    pub shortlink: String,
    pub status: String,
    pub updated_at: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MaintenanceUpdate {
    pub body: String,
    pub created_at: String,
    pub display_at: String,
    pub id: String,
    pub incident_id: String,
    pub status: String,
    pub updated_at: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Status {
    pub indicator: String,
    pub description: Option<String>,
}
