import requestClient, { Payload, Response } from "@/utils/requestUtil";

export interface ResourceInfo {
  /**
   * 倒计时，示例：-
   */
  countdown: Countdown[];
  /**
   * 示例：-
   */
  resources: Resources;
}

export interface Countdown {
  /**
   * 活动类型[activity,banner,live]，示例：banner
   */
  countdown_type?: "activity" | "banner" | "live";
  /**
   * 倒计时结束显示时间，示例：2022-02-17 03:59:59
   */
  over_time: string;
  /**
   * 倒计时备注，示例：刻俄柏[兑换],水月,赤冬,莱恩哈特[ 兑换],安哲拉
   */
  remark: string;
  /**
   * 倒计时开始显示时间，示例：2022-02-03 04:00:00
   */
  start_time: string;
  /**
   * 倒计时展示文本，示例：当前轮换池结束
   */
  text: string;
  /**
   * 倒计时结束时间，示例：2022-02-17 03:59:59
   */
  time: string;
}

/**
 * 示例：-
 */
export interface Resources {
  /**
   * 资源全开放结束时间，示例：2021-12-06 03:59:59
   */
  over_time: string;
  /**
   * 资源全开放开始时间，示例：2021-11-22 16:00:00
   */
  start_time: string;
}

export function getResourceInfo(): Promise<Response<Payload<ResourceInfo>>> {
  return requestClient.requestPayload({
    url: `/cdn/operate/resource/get`,
    method: "GET",
    requestTarget: "ServeCDN",
  });
}
