//! Api Custom errors.
use serde::Serialize;

#[derive(Serialize)]
pub struct NotfoundErrorResponse {
    pub error: String,
    pub code: u16,
}
