use serde::{Deserialize, Serialize, Serializer};

use tauri::{command, AppHandle, Manager};
use tracing::instrument;

use url::Url;

#[derive(Debug, thiserror::Error)]
pub enum NotifyError {
    #[error(transparent)]
    TauriApi(#[from] tauri::api::Error),
    #[cfg(windows)]
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[cfg(windows)]
    #[error(transparent)]
    Toast(#[from] winrt_toast::WinToastError),
    #[cfg(windows)]
    #[error(transparent)]
    Request(#[from] reqwest::Error),
    #[cfg(windows)]
    #[error(transparent)]
    RequestMiddle(#[from] reqwest_middleware::Error),
    #[cfg(windows)]
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl Serialize for NotifyError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.to_string().serialize(serializer)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationPayload {
    title: String,
    body: String,
    #[serde(default)]
    has_sound: bool,
    time: String,
    image_url: Option<Url>,
}
#[command(async)]
#[instrument(name = "SendToastNotify", skip(app), err)]
pub async fn send_system_notification(
    app: AppHandle,
    payload: NotificationPayload,
) -> Result<(), NotifyError> {
    #[cfg(windows)]
    {
        use crate::{request_client::RequestClient, state::get_cache_dir};
        use http::{HeaderValue, Method};
        use std::sync::OnceLock;
        use tracing::{error, info};
        use winrt_toast::{
            content::text::TextPlacement, Image, Scenario, Text, Toast, ToastManager,
        };

        static MANAGER: OnceLock<ToastManager> = OnceLock::new();
        let manager = MANAGER
            .get_or_init(|| ToastManager::new(app.config().tauri.bundle.identifier.as_str()));

        let mut toast = Toast::new();
        toast.launch("click:cookie");
        toast.text1(payload.title);
        toast.text2(Text::new(payload.body));
        if let Some(img) = payload.image_url {
            let dir = get_cache_dir(app.clone());
            let client = RequestClient::get_this(app.clone());
            let resp = client
                .request(Method::GET, img)
                .header("Referer", HeaderValue::from_static("https://weibo.com/"))
                .send()
                .await?;
            let byte = resp.bytes().await?;
            let tmp_file = dir.join("notify_img.jpg");
            std::fs::write(&tmp_file, byte)?;

            toast.image(1, Image::new_local(tmp_file)?);
        }

        toast.text3(
            Text::new(format!("at: {}", payload.time)).with_placement(TextPlacement::Attribution),
        );
        toast.scenario(Scenario::Reminder);
        let main_window = app.get_window("main").unwrap();
        manager.show_with_callbacks(
            &toast,
            Some(Box::new(move |launch| {
                let re = launch
                    .map_err(NotifyError::from)
                    .and_then(|_| main_window.show().map_err(Into::into));
                match re {
                    Ok(_) => {}
                    Err(err) => {
                        error!(Action="Respond To User Select", Error = %err);
                    }
                };
            })),
            Some(Box::new(|reason| match reason {
                Ok(reason) => {
                    info!(Action="Notify Dismiss",reason= ?reason);
                }
                Err(err) => {
                    error!(Action="Notify Dismiss", Error = %err);
                }
            })),
            Some(Box::new(|err| {
                error!(Action="Notify Failure", Error = %err);
            }) as _),
        )?;
    }
    #[cfg(not(windows))]
    {
        let mut notify =
            tauri::api::notification::Notification::new(&app.config().tauri.bundle.identifier)
                .title(payload.title)
                .body(payload.body);
        if payload.has_sound {
            notify = notify.sound(tauri::api::notification::Sound::Default)
        }
        notify.show()?;
    }

    Ok(())
}
