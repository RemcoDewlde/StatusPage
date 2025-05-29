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

    pub fn to_url(&self, domain: &String, is_custom_domain: bool) -> String {
        let base = if is_custom_domain {
            domain.clone()
        } else {
            format!("{}.statuspage.io", domain)
        };
        match self {
            ApiAction::Summary => format!("https://{}/api/v2/summary.json", base),
            ApiAction::Status => format!("https://{}/api/v2/status.json", base),
            ApiAction::Components => format!("https://{}/api/v2/components.json", base),
            ApiAction::UnresolvedIncidents => format!("https://{}/api/v2/incidents/unresolved.json", base),
            ApiAction::AllIncidents => format!("https://{}/api/v2/incidents.json", base),
            ApiAction::UpcomingMaintenances => format!("https://{}/api/v2/scheduled-maintenances/upcoming.json", base),
            ApiAction::ActiveMaintenances => format!("https://{}/api/v2/scheduled-maintenances/active.json", base),
            ApiAction::AllMaintenances => format!("https://{}/api/v2/scheduled-maintenances.json", base),
        }
    }
}
