import { invoke } from "@tauri-apps/api";
import { writeText } from "@tauri-apps/api/clipboard";
import { readTextFile } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/shell";

// 获取文件
export async function getLocalFileText(path: string): Promise<string> {
  return await readTextFile(path);
}

// 使用电脑默认浏览器打开链接
export async function openUrlInUserBrowser(url: string) {
  await open(url);
}

export async function copyInfo(data: { data: string; type: string }) {
  console.log(data);
  await (data.type === "text"
    ? writeText(data.data)
    : invoke("copy_image", { image: data.data }));
}

export async function getHasRefererImageBase64(
  url: string,
  referer: string = "https://weibo.com/",
): Promise<string> {
  console.log(url);
  console.log(referer);
  return await invoke<string>("request_refer_image", {
    url,
    refer: referer,
  });
}

export async function bootStartSetting(isBoot: boolean): Promise<boolean> {
  return await (isBoot
    ? invoke<boolean>("set_auto_launch", { autoLaunch: true })
    : invoke<boolean>("set_auto_launch", { autoLaunch: false }));
}

export async function getBootStartSetting(): Promise<boolean> {
  return await invoke<boolean>("auto_launch_setting");
}
