import { invoke } from "@tauri-apps/api";

class LocalStorage {
  async getItem<T>(key: string): Promise<T | null> {
    return await invoke<T | null>("get_item", { key });
  }
  async setItem<T>(key: string, value: T) {
    return await invoke("set_item", { key, value });
  }
}

const storage = new LocalStorage();

export default storage;
