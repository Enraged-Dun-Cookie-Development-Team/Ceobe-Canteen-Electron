import requestClient, { Payload, Response } from "@/utils/requestUtil";

export interface VideoItem {
  /**
   * up主，示例：杨颜同学
   */
  author: string;
  /**
   *
   * 封面图，示例：http://i0.hdslb.com/bfs/archive/9315a9911f8af1441854a16c93339926b9c66a8b.jpg@@200w_125h_1c.webp
   */
  cover_img: string;
  /**
   * 结束显示时间，示例：2022-01-04 15:59:59
   */
  over_time: string;
  /**
   * 开始显示时间，示例：2021-12-24 04:00:00
   */
  start_time: string;
  /**
   * 标题，示例：2022明日方舟新春会「流光启明」庆 典宣传PV
   */
  title: string;
  /**
   * 视频链接，示例：https://www.bilibili.com/video/bv19b4y1v7Wa
   */
  video_link: string;
}

/**
 * 视频推荐列表
 * @returns {*}
 */
export function getVideoList(): Promise<Response<Payload<VideoItem[]>>> {
  return requestClient.requestPayload({
    url: `/cdn/operate/video/list`,
    method: "GET",
    requestTarget: "ServeCDN",
  });
}
