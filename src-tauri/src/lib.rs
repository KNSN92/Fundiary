mod daily_notification;

use crate::daily_notification::{start_notificating, stop_notificating};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            start_notificating,
            stop_notificating,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
