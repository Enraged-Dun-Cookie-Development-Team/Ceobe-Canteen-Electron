import { UnlistenFn } from "@tauri-apps/api/event";

import datasourceConfigOperate from "../api/operations/datasourceConfig";
import storage from "../api/operations/localStorage";
import logger from "../api/operations/logger";
import newestTimeline, { TimelineData } from "../api/operations/newestTimeline";
import operate from "../api/operations/operate";
import { getCookieList } from "../api/resourceFetcher/cookieList";
import { getDatasourceComb } from "../api/resourceFetcher/datasourceCombine";
import {
  DatasourceItem,
  getResourceList,
} from "../api/resourceFetcher/datasourceList";
import { getCookieNewestInfo } from "../api/resourceFetcher/newestCookie";

const CombineIdKey = "datasource-comb";

export class BackgroundRunner {
  old_cookie_id: string | null = null;
  old_update_cookie_id: string | null = null;
  datasource_comb_id: string;
  old_cookie_id_map: Map<string, boolean> = new Map();
  init_fetched: boolean = false; // 是否初次蹲过饼
  timeline: TimelineData | null = null;
  timeoutId: null | NodeJS.Timeout = null;
  unlistenUpdate: null | UnlistenFn = null;

  private constructor(combineId: string, initFetched: boolean = false) {
    this.datasource_comb_id = combineId;
    this.init_fetched = initFetched;
  }

  public static async init(): Promise<BackgroundRunner> {
    // 获取订阅的组合ID
    let combine_id = await storage.getItem<string>(CombineIdKey);
    if (combine_id == null) {
      const resource_data = await getResourceList();
      const uuids: string[] = resource_data.data.data.map(
        (item: DatasourceItem) => item.unique_id,
      );
      const fullCombineId = await getDatasourceComb(uuids);
      combine_id = fullCombineId.data.data.datasource_comb_id;

      await storage.setItem(CombineIdKey, combine_id);
    }
    return new BackgroundRunner(combine_id as string);
  }

  public async run() {
    this.unlistenUpdate = await datasourceConfigOperate.datasourceCombUpdated(
      async () => {
        const combineId = await storage.getItem<string>("datasource-comb");
        if (combineId) {
          this.datasource_comb_id = combineId;
        }
        this.old_cookie_id = null;
        this.old_update_cookie_id = null;
        this.init_fetched = false;
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        await this.fetchCookie();
      },
    );
    await newestTimeline.knowNeedTimeline(() => {
      if (this.timeline) {
        newestTimeline.sendTimeline(this.timeline);
      }
    });
    await this.fetchCookie();
  }

  public release() {
    if (this.unlistenUpdate) {
      this.unlistenUpdate();
    }
  }

  private async fetchCookie() {
    try {
      const newestCookieInfo = await getCookieNewestInfo(
        this.datasource_comb_id,
      );

      const { cookie_id, update_cookie_id } = newestCookieInfo.data;
      if (
        cookie_id != null &&
        (cookie_id !== this.old_cookie_id ||
          update_cookie_id !== this.old_update_cookie_id)
      ) {
        console.log(this.datasource_comb_id, cookie_id, update_cookie_id);
        await logger.info("backgroundUtil", {
          combineId: this.datasource_comb_id,
          cookieId: cookie_id,
          updateCookieId: update_cookie_id,
        });
        const cookies_data = await getCookieList(
          this.datasource_comb_id,
          cookie_id,
          update_cookie_id ?? undefined,
        );
        const cookies_info: TimelineData = {
          ...cookies_data.data.data,
          comb_id: this.datasource_comb_id,
          update_cookie_id,
        };
        this.old_cookie_id = cookie_id;
        this.old_update_cookie_id = update_cookie_id;

        cookies_info.comb_id = this.datasource_comb_id;
        cookies_info.update_cookie_id = update_cookie_id;

        for (const cookie of cookies_info.cookies) {
          if (
            !this.old_cookie_id_map.get(
              `${cookie.source.type}:${cookie.source.data}:${cookie.item.id}`,
            )
          ) {
            this.old_cookie_id_map.set(
              `${cookie.source.type}:${cookie.source.data}:${cookie.item.id}`,
              true,
            );
            if (this.init_fetched) {
              logger.info("backgroundUtil", {
                module: "backgroundRunner",
                state: "SendNewCookie",
              });
              operate.openNotificationWindow(cookie);
            }
          }
        }
        if (!this.init_fetched) {
          this.init_fetched = true;
        }
        this.timeline = cookies_info;
        await newestTimeline.sendTimeline(cookies_info);
      } else if (cookie_id == null) {
        const cookies_info: TimelineData = {
          cookies: [],
          next_page_id: null,
          comb_id: this.datasource_comb_id,
          update_cookie_id: null,
        };
        await newestTimeline.sendTimeline(cookies_info);
      }
    } catch (error) {
      await logger.error("Background", {
        err: error,
      });
    } finally {
      this.timeoutId = setTimeout(async () => {
        await this.fetchCookie();
      }, 15 * 1000);
    }
  }
}
