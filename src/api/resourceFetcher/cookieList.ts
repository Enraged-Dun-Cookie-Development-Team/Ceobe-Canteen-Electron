import requestClient, { Payload, Response } from "@/utils/requestUtil";

export interface CookieList {
  cookies: Cookie[];
  /**
   * 下一页饼id，null就是没有下一页
   */
  next_page_id?: null | string;
}

export interface Cookie {
  /**
   * 数据源名字
   */
  datasource: string;
  /**
   * 原始饼信息
   */
  default_cookie: DefaultCookie;
  /**
   * 数据源图标
   */
  icon: string;
  /**
   * 这个下面有些平台自己的字段，写的时候再对接吧
   */
  item: CookieItemBase & { [props: string]: any };
  /**
   * 数据源信息
   */
  source: Source;
  timestamp: Timestamp;
}

export interface CookieItemBase {
  id: string;
  url: string;
}

/**
 * 原始饼信息
 */
export interface DefaultCookie {
  /**
   * 图片，null为没图片
   */
  images?: Image[] | null;
  /**
   * 内容，如果空字符串可以不显示
   */
  text: string;
}

export interface Image {
  /**
   * 压缩图，为null就是没有原图对应压缩图
   */
  compress_url?: null | string;
  /**
   * 原图
   */
  origin_url: string;
}

/**
 * 数据源信息
 */
export interface Source {
  /**
   * 数据源id
   */
  data: string;
  /**
   * 数据源类型
   */
  type: string;
}

export interface Timestamp {
  /**
   * 蹲饼时间，时间戳
   */
  fetcher: number;
  /**
   * 平台时间，时间戳
   */
  platform?: number;
  /**
   * 平台时间精度，枚举（'none' | 'day' | 'hour' | 'minute' | 'second' | 'ms'）
   */
  platform_precision: "none" | "day" | "hour" | "minute" | "second" | "ms";
}

/**
 * 返回带有cookies的json
 * @param comb_id string
 * @param cookie_id string
 * @param update_cookie_id string
 * @returns {*}
 */
export function getCookieList(
  comb_id: string,
  cookie_id: string,
  update_cookie_id?: string,
): Promise<Response<Payload<CookieList>>> {
  const query: Record<string, any> = {
    datasource_comb_id: comb_id,
    cookie_id,
  };

  if (update_cookie_id) {
    query.update_cookie_id = update_cookie_id;
  }

  return requestClient.requestPayload<CookieList>({
    requestTarget: "ServeCDN",
    url: `/cdn/cookie/mainList/cookieList`,
    query,
    method: "GET",
  });
}
