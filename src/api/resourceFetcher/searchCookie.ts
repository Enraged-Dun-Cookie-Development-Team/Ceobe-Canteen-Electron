import requestClient, { Payload, Response } from "@/utils/requestUtil";

import { Cookie } from "./cookieList";

export interface CookiePagination {
  cookies: Cookie[];
  /**
   * 下一页饼id，null就是没有下一页
   */
  next_page_id?: null | string;
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
  compress_url: null | string;
  /**
   * 原图
   */
  origin_url: string;
}

/**
 * 这个下面有些平台自己的字段，写的时候再对接吧
 */
export interface Item {
  id: string;
  /**
   * 跳转链接
   */
  url: string;
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
  platform_precision: string;
}

/**
 * 获取饼搜索列表
 * @returns {*}
 */
export function getCookieSearchList({
  cookie_id,
  datasource_comb_id,
  search_word,
}: {
  cookie_id?: string;
  datasource_comb_id: string;
  search_word: string;
}): Promise<Response<Payload<CookiePagination>>> {
  const params: Record<string, any> = {
    datasource_comb_id,
    search_word,
  };

  if (cookie_id) {
    params.cookie_id = cookie_id;
  }

  return requestClient.requestPayload({
    url: `/canteen/cookie/search/list`,
    method: "GET",
    query: params,
  });
}
