import {invoke} from "@tauri-apps/api/core";
import {open} from "@tauri-apps/plugin-shell";

class LocationFetch {
    async configDir(): Promise<string> {
        return await invoke<string>("get_app_config_path")
    }

    async cacheDir(): Promise<string> {
        return await invoke<string>("get_app_cache_path")
    }

    async openConfigDir(): Promise<void> {
        await open(await this.configDir())
    }

    async openCacheDir() {
        await open(await this.cacheDir())
    }

}

const locationFetch = new LocationFetch()
export default locationFetch