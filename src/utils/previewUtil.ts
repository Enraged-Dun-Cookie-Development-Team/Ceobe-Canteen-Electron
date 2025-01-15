import { invoke } from "@tauri-apps/api";

export async function previewUrl(url: string, title: string) {
  await invoke("read_detail", {
    url,
    title,
  });
}
