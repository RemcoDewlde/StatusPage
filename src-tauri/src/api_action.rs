use crate::models::{ApiAction, CustomError};

impl ApiAction {
    pub fn from_str(action: &str) -> Result<Self, CustomError> {
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

    pub fn to_url(&self, page_id: &String) -> String {
        match self {
            ApiAction::Summary => format!("https://{}.statuspage.io/api/v2/summary.json", page_id),
            ApiAction::Status => format!("https://{}.statuspage.io/api/v2/status.json", page_id),
            ApiAction::Components => {
                format!("https://{}.statuspage.io/api/v2/components.json", page_id)
            }
            ApiAction::UnresolvedIncidents => format!(
                "https://{}.statuspage.io/api/v2/incidents/unresolved.json",
                page_id
            ),
            ApiAction::AllIncidents => {
                format!("https://{}.statuspage.io/api/v2/incidents.json", page_id)
            }
            ApiAction::UpcomingMaintenances => format!(
                "https://{}.statuspage.io/api/v2/scheduled-maintenances/upcoming.json",
                page_id
            ),
            ApiAction::ActiveMaintenances => format!(
                "https://{}.statuspage.io/api/v2/scheduled-maintenances/active.json",
                page_id
            ),
            ApiAction::AllMaintenances => format!(
                "https://{}.statuspage.io/api/v2/scheduled-maintenances.json",
                page_id
            ),
        }
    }
}
