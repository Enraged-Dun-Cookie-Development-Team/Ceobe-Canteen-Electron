import { invoke } from "@tauri-apps/api";
import {
  appWindow,
  getAll,
  PhysicalPosition,
  PhysicalSize,
  WebviewWindow,
} from "@tauri-apps/api/window";

import {
  bootStartSetting,
  copyInfo,
  getBootStartSetting,
  openUrlInUserBrowser,
} from "../function";
import { Cookie } from "../resourceFetcher/cookieList";

import notification from "./notification";

class Operate {
  async openNotificationWindow(cookie: Cookie) {
    console.log(`send Notification`);
    if (await invoke("should_silence")) {
      console.log("Detect FullScreen, cancel notify");
      return;
    }

    if (await notification.needNotifyPop()) {
      const monitorInfo = await invoke<{
        work_space: PhysicalSize;
        left_top: PhysicalPosition;
      }>("get_monitor_info");

      const size = monitorInfo.work_space;
      const window = getAll().find(
        (window: WebviewWindow) => window.label === "notification",
      )!;
      const winSize = await window.outerSize();
      console.log(winSize, size);
      const w = size?.width ?? 1920;
      const h = size?.height ?? 1080;
      console.log(w, h);
      await window.setPosition(
        new PhysicalPosition(
          w - winSize.width + monitorInfo.left_top.x,
          h - winSize.height + monitorInfo.left_top.y,
        ),
      );
      console.log(await window.outerPosition());
      console.log("send cookie", cookie);
      await window.emit("new_cookie_info", cookie);
    } else if (await notification.needBeep()) {
      await this.messageBeep();
    } else if (await notification.needSystemNotify()) {
      await notification.sendSystemNotify({
        body: cookie.default_cookie.text,
        has_sound: true,
        time: new Date(cookie.timestamp.platform!).toLocaleString(),
        image_url: cookie.default_cookie.images
          ? cookie.default_cookie.images[0].origin_url
          : undefined,
        title: `小刻在${cookie.datasource}蹲到饼了`,
      });
    }
  }

  async copy(param: { data: string; type: string }) {
    await copyInfo(param);
  }

  async openUrlInBrowser(url: string) {
    await openUrlInUserBrowser(url);
  }

  async minus() {
    const window = appWindow;
    await window.minimize();
  }

  async maximize() {
    await appWindow.toggleMaximize();
  }

  async close() {
    await appWindow.hide();
  }

  async exit() {
    await invoke("quit");
  }

  async bootSetting(isBoot: boolean) {
    return await bootStartSetting(isBoot);
  }

  async getBootSetting() {
    return await getBootStartSetting();
  }

  async messageBeep() {
    await invoke("message_beep");
  }

  async hideNotifyIcon() {
    await invoke("hide_notification");
  }
}

const operate = new Operate();

export default operate;
