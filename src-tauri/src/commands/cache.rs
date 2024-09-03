use crate::state::get_cache_dir;
use once_cell::sync::Lazy;
use std::sync::Mutex;
use std::time::{Duration, SystemTime};
use std::{fmt, fs, io};
use tauri::{command, AppHandle};
use tracing::{debug, trace, info};

static CACHE_CLEAR_MUTEX: Lazy<Mutex<()>> = Lazy::new(|| Mutex::new(()));

#[derive(Debug, serde::Deserialize, serde::Serialize)]
#[serde(tag = "status", content = "data")]
pub enum ClearStatus {
    Clearing,
    Done(u64),
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Debug)]
enum FileSize {
    B(u64),
    KB(f64),
    MB(f64),
    GB(f64),
    TB(f64),
}

impl FileSize {
    pub fn new(bytes_size: u64) -> Self {
        let level: [u64; 5] = {
            let mut arr = [0; 5];
            for (i, item) in arr.iter_mut().enumerate() {
                *item = bytes_size >> (i * 10);
            }
            arr.reverse();
            arr
        };

        fn round_size(main: u64, sub: u64) -> f64 {
            (main as f64) + (sub & 1023) as f64 / 1024.0
        }

        debug!("level: {:?}", level);
        match level {
            [0, 0, 0, 0, b] => FileSize::B(b),
            [0, 0, 0, kb, b] => FileSize::KB(round_size(kb, b)),
            [0, 0, mb, kb, _] => FileSize::MB(round_size(mb, kb)),
            [0, gb, mb, _, _] => FileSize::GB(round_size(gb, mb)),
            [tb, gb, _, _, _] => FileSize::TB(round_size(tb, gb)),
        }
    }
}

impl fmt::Display for FileSize {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            FileSize::B(b) => write!(f, "{} B", b),
            FileSize::KB(kb) => write!(f, "{:.1} KB", kb),
            FileSize::MB(mb) => write!(f, "{:.1} MB", mb),
            FileSize::GB(gb) => write!(f, "{:.1} GB", gb),
            FileSize::TB(tb) => write!(f, "{:.1} TB", tb),
        }
    }
}

#[command(async)]
pub async fn get_cache_dir_size(app: AppHandle) -> Result<String, Error> {
    fn calc_dir_size(mut dir: fs::ReadDir) -> io::Result<u64> {
        dir.try_fold(0, |acc, file| {
            let file = file?;
            let size = match file.metadata()? {
                data if data.is_dir() => calc_dir_size(fs::read_dir(file.path())?)?,
                data => data.len(),
            };
            trace!("calc current file size: {}", size);
            Ok(acc + size)
        })
    }

    let bytes_size = calc_dir_size(fs::read_dir(get_cache_dir(app))?)?;
    info!("cache dir size: {}", bytes_size);

    Ok(FileSize::new(bytes_size).to_string())
}

#[command(async)]
pub async fn clear_cache_dir(app: AppHandle) -> Result<ClearStatus, Error> {
    let lock = CACHE_CLEAR_MUTEX.try_lock();
    if lock.is_err() {
        return Ok(ClearStatus::Clearing);
    }

    let cache_dir = get_cache_dir(app);
    // 删除3天前的缓存
    let now = SystemTime::now();
    let mut count = 0;

    for entry in fs::read_dir(cache_dir)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        let modified = metadata.modified().unwrap();

        if now.duration_since(modified).unwrap() > Duration::from_secs(60 * 60 * 24 * 3) {
            debug!("remove dir: {:?}", entry.path());
            fs::remove_dir_all(entry.path())?;
            count += 1;
        }
    }

    debug!("clear cache dir done, remove {} dirs", count);
    Ok(ClearStatus::Done(count))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_size() {
        assert_eq!(FileSize::new(0).to_string(), "0 B");
        assert_eq!(FileSize::new(1023).to_string(), "1023 B");
        assert_eq!(FileSize::new(1024).to_string(), "1.0 KB");
        assert_eq!(FileSize::new(1024 * 1024 - 1).to_string(), "1024.0 KB");
        assert_eq!(FileSize::new(1024 * 1024 - 512).to_string(), "1023.5 KB");
        assert_eq!(FileSize::new(1024 * 1024).to_string(), "1.0 MB");
        assert_eq!(
            FileSize::new(1024 * 1024 * 1022 + 513 * 1024).to_string(),
            "1022.5 MB"
        );
        assert_eq!(FileSize::new(1024 * 1024 * 1024).to_string(), "1.0 GB");
        assert_eq!(
            FileSize::new(1024 * 1024 * 1024 * 1024).to_string(),
            "1.0 TB"
        );
        assert_eq!(FileSize::new(1024 * 1024 + 5210).to_string(), "1.0 MB");
    }

    #[test]
    fn test_clear_status_serde() {
        let status = ClearStatus::Clearing;
        assert_eq!(
            serde_json::to_string(&status).unwrap(),
            r#"{"status":"Clearing"}"#
        );
        let status = ClearStatus::Done(10);
        assert_eq!(
            serde_json::to_string(&status).unwrap(),
            r#"{"status":"Done","data":10}"#
        );
    }
}
