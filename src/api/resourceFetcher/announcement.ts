import requestClient, { Payload, Response } from "@/utils/requestUtil";

export interface Announcement {
  /**
   * html数据，示例：<div class="online-area"><img class="online-title-img radius"
   * :src="https://ak.hycdn.cn/announce/images/20220125/e11f6c95958d685bbbedfd0fd799755a.JPG"/><div><p><font
   * color="#e03b3b">故事集「阴云火花」</font>将 于<font color="#ffba4b">2月22号</font>结束</p><p>结束时间为<font
   * color="#ffba4b">周二4:00</font></p><p>活动期间掉落<font color="#e4d64a">聚酸酯组</font>、<font
   * color="#e4d64a">晶体元件</font></p><p>活动开启时，快捷链接更新作业视频</p><p>或者点击 <drawer>这里</drawer>
   * 快速跳转</p></div></div>
   */
  html: string;
  /**
   * 是否推送，示例：-
   */
  notice: boolean;
  /**
   * 结束显示时间，示例：2022-02-22 03:59:59
   */
  over_time: string;
  /**
   * 开始显示时间，示例：2022-02-15 16:00:00
   */
  start_time: string;
}

/**
 * 获取公告
 */
export function getAnnouncementInfo(): Promise<
  Response<Payload<Announcement[]>>
> {
  return requestClient.requestPayload({
    url: `/cdn/operate/announcement/list`,
    method: "GET",
    requestTarget: "ServeCDN",
  });
}
