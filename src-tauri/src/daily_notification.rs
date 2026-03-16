use std::{str::FromStr, sync::Mutex};

use chrono::Local;
use cron::Schedule;
use std::time::Duration;
use tauri::{command, AppHandle, Manager};
use tauri_plugin_notification::NotificationExt;
use tokio::task::{spawn_blocking, AbortHandle};

pub struct DailyNotification(pub Option<AbortHandle>);

#[command]
pub fn start_notificating(app_handle: AppHandle, hour: i32, minute: i32) -> bool {
    let daily_notification = app_handle.state::<Mutex<DailyNotification>>();
    let mut daily_notification = daily_notification.lock().unwrap();
    if let Some(handle) = &daily_notification.0 {
        handle.abort();
    }
    if !((0..24).contains(&hour) && (0..60).contains(&minute)) {
        return false;
    }
    let schedule = match Schedule::from_str(&format!("{minute} {hour} */1 * * *")) {
        Ok(schedule) => schedule,
        Err(_) => return false,
    };
    let loop_app_handle = app_handle.clone();
    let handle = spawn_blocking(async move || {
        let mut next_tick = schedule.upcoming(Local).next();
        loop {
            if let Some(tick) = next_tick {
                let now = Local::now();
                // (tick - now) < TimeDelta::seconds(60);
                if tick <= now {
                    notificate(loop_app_handle.clone());
                    next_tick = schedule.upcoming(Local).next();
                }
            }
            tokio::time::sleep(Duration::from_secs(60)).await;
        }
    })
    .abort_handle();
    daily_notification.0 = Some(handle);
    true
}

#[command]
pub fn stop_notificating(app_handle: AppHandle) {
    let daily_notification = app_handle.state::<Mutex<DailyNotification>>();
    let mut daily_notification = daily_notification.lock().unwrap();
    if let Some(handle) = &daily_notification.0 {
        handle.abort();
    }
    daily_notification.0 = None;
}

pub fn notificate(app_handle: AppHandle) {
    app_handle
        .notification()
        .builder()
        .title("デイリー通知")
        .body("今日は何をしましたか？日記に書いてみましょう！")
        .show()
        .unwrap();
}
