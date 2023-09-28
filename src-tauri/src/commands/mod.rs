mod auto_launch;
mod clipboard;
mod front_logger;
mod hide_notification;
mod local_storage;
mod monitor_info;
mod preview_page;
mod quit;
mod request_client;
mod request_refer_image;
mod resource_location;
mod is_debug;
mod update_available;

pub use self::auto_launch::{auto_launch_setting, set_auto_launch};
pub use clipboard::copy_image;
pub use front_logger::front_logger;
pub use hide_notification::hide_notification;
pub use local_storage::{get_item, set_item};
pub use monitor_info::{get_monitor_info, message_beep};
pub use preview_page::{back_preview, read_detail};
pub use quit::quit;
pub use request_client::send_request;
pub use request_refer_image::request_refer_image;
pub use resource_location::{get_app_cache_path,get_app_config_path};
pub use is_debug::is_debug;
