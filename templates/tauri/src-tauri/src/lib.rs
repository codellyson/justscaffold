use serde::Serialize;

/// Serialized as a tagged union so the frontend receives a structured error
/// it can branch on, rather than a stringified message it has to pattern-match.
/// `src/lib/commands.ts` mirrors this shape.
#[derive(Debug, Serialize, thiserror::Error)]
#[serde(tag = "kind", content = "message", rename_all = "snake_case")]
pub enum CommandError {
    #[error("{0}")]
    InvalidInput(String),
    #[error("{0}")]
    NotFound(String),
    #[error("{0}")]
    Internal(String),
}

pub type CommandResult<T> = Result<T, CommandError>;

#[derive(Serialize)]
pub struct AppInfo {
    name: String,
    version: String,
    platform: String,
}

#[tauri::command]
fn get_app_info() -> CommandResult<AppInfo> {
    Ok(AppInfo {
        name: env!("CARGO_PKG_NAME").to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        platform: std::env::consts::OS.to_string(),
    })
}

#[tauri::command]
fn greet(name: &str) -> CommandResult<String> {
    let name = name.trim();
    if name.is_empty() {
        return Err(CommandError::InvalidInput("name must not be empty".into()));
    }
    Ok(format!("Hello, {name}! You've been greeted from Rust."))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_app_info, greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
