import {appWindow, getAll, WebviewWindow} from "@tauri-apps/api/window";
import {listen, UnlistenFn, Event} from "@tauri-apps/api/event";
import {Cookie} from "../resourceFetcher/cookieList";
import storage from "./localStorage";

class NotificationOperate {
    async getInfo(callback: (event: string, payload: Cookie) => void,): Promise<UnlistenFn> {
        return await listen<Cookie>("new_cookie_info", (event: Event<Cookie>) => callback(event.event, event.payload));
    }

    async closeWindow() {
        let window: WebviewWindow | null = getAll().find((window: WebviewWindow) => window.label == "main")
        if (window) {
            if (await window.isMinimized()) {
                await window.unminimize()
            }
            if (!await window.isVisible()) {
                await window.show()
            }
            await window.setFocus()
        }

        await appWindow.hide();
    }

    async setNotificationMode(modeIdx: number) {
        console.log("setting Notify mod",modeIdx)
        await storage.setItem("setting.notify", modeIdx);
    }

    async getNotificationMode(): Promise<{ idx: number, value: string }> {
        const idx = await storage.getItem<number>("setting.notify") ?? NotifyMode.PopUpAndBeep.idx
        return allNotifyMode.find((mode)=>mode.idx==idx)!!
    }

    async needNotifyPop():Promise<boolean>{
        const mode =await this.getNotificationMode()
        return mode.idx == NotifyMode.PopUpOnly.idx || mode.idx == NotifyMode.PopUpAndBeep.idx;
    }
    async needBeep():Promise<boolean>{
        const mode = await  this.getNotificationMode()
        return mode.idx == NotifyMode.PopUpAndBeep.idx || mode.idx == NotifyMode.BeepOnly.idx;
    }
}

export const NotifyMode = Object.freeze({
    PopUpOnly: {
        idx: 0, value: "仅弹窗"
    }, BeepOnly: {
        idx: 1, value: "仅提示音"
    }, PopUpAndBeep: {
        idx: 2, value: "弹窗且提示音"
    }, None: {
        idx: 3, value: "无"
    },
})
export const allNotifyMode = [NotifyMode.PopUpAndBeep, NotifyMode.BeepOnly, NotifyMode.PopUpOnly, NotifyMode.None]
const notification = new NotificationOperate();

export default notification;
