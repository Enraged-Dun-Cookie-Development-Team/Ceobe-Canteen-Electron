import { invoke } from "@tauri-apps/api";
import { listen, UnlistenFn, Event } from "@tauri-apps/api/event";
import { appWindow, getAll, WebviewWindow } from "@tauri-apps/api/window";

import { Cookie } from "../resourceFetcher/cookieList";

import storage from "./localStorage";

class NotificationOperate {
  async getInfo(
    callback: (event: string, payload: Cookie) => void,
  ): Promise<UnlistenFn> {
    return await listen<Cookie>("new_cookie_info", (event: Event<Cookie>) =>
      callback(event.event, event.payload),
    );
  }

  async closeWindow() {
    const window: WebviewWindow | null =
      getAll().find((window: WebviewWindow) => window.label === "main") ?? null;
    if (window) {
      if (await window.isMinimized()) {
        await window.unminimize();
      }
      if (!(await window.isVisible())) {
        await window.show();
      }
      await window.setFocus();
    }

    await appWindow.hide();
  }

  async setNotificationMode(modeIdx: number) {
    console.log("setting Notify mod", modeIdx);
    await storage.setItem("setting.notify", modeIdx);
  }

  async getNotificationMode(): Promise<{
    idx: number;
    value: string;
    tip: string;
  }> {
    const idx =
      (await storage.getItem<number>("setting.notify")) ??
      NotifyMode.PopUpAndBeep.idx;
    const mode = allNotifyMode.find((mode) => mode.idx === idx);
    return mode || NotifyMode.None;
  }

  async needNotifyPop(): Promise<boolean> {
    const mode = await this.getNotificationMode();
    return (
      mode.idx === NotifyMode.PopUpOnly.idx ||
      mode.idx === NotifyMode.PopUpAndBeep.idx
    );
  }

  async needBeep(): Promise<boolean> {
    const mode = await this.getNotificationMode();
    return (
      mode.idx === NotifyMode.PopUpAndBeep.idx ||
      mode.idx === NotifyMode.BeepOnly.idx
    );
  }
  async needSystemNotify(): Promise<boolean> {
    const mode = await this.getNotificationMode();
    return mode.idx === NotifyMode.SystemToast.idx;
  }

  async sendSystemNotify(payload: NotifyPayload) {
    await invoke("send_system_notification", { payload });
  }
}

export interface NotifyPayload {
  title: string;
  body: string;
  time: string;
  has_sound?: boolean;
  image_url?: string;
}

export const NotifyMode = Object.freeze({
  PopUpOnly: {
    idx: 0,
    value: "仅弹窗",
    tip: "当发现新饼后只会出现右下角弹窗",
  },
  BeepOnly: {
    idx: 1,
    value: "仅提示音",
    tip: "当发现新饼后只会发出提示音",
  },
  PopUpAndBeep: {
    idx: 2,
    value: "弹窗且提示音",
    tip: "当发现新饼后不但出现右下角弹窗，同时发出提示音",
  },
  SystemToast: {
    idx: 4,
    value: "使用系统消息",
    tip: "当发现新饼时发出系统弹窗，Windows可以拉起主窗口",
  },
  None: {
    idx: 3,
    value: "无",
    tip: "当发现新饼后无任何行为",
  },
});
export const allNotifyMode = [
  NotifyMode.PopUpAndBeep,
  NotifyMode.BeepOnly,
  NotifyMode.PopUpOnly,
  NotifyMode.SystemToast,
  NotifyMode.None,
];
const notification = new NotificationOperate();

export default notification;
