import requestClient, { Payload, Response } from "@/utils/requestUtil.js";

export interface Datum {
  /**
   * logo
   */
  icon_url: string;
  /**
   * id
   */
  id: string;
  links: Link[];
  /**
   * 描述
   */
  localized_description: LocalizedLanguage;
  /**
   * 名字
   */
  localized_name: LocalizedLanguage;
  /**
   * slogen
   */
  localized_slogan: LocalizedLanguage;
  /**
   * tags
   */
  localized_tags: LocalizedTags;
}

export interface Link {
  /**
   * 链接名字
   */
  localized_name: LocalizedLanguage;
  /**
   * 是否为主要链接
   */
  primary?: boolean;
  /**
   * 区域，枚举(CHINA_MAINLAND, EXCEPT_CHINA_MAINLAND)
   */
  regionality: string;
  /**
   * 链接
   */
  url: string;
}

/**
 * 多语言
 */
export interface LocalizedLanguage {
  en_US: string;
  zh_CN: string;
}

/**
 * tags
 */
export interface LocalizedTags {
  en_US: string[];
  zh_CN: string[];
}

export function getToolsLinks(): Promise<Response<Payload<Datum[]>>> {
  return requestClient.requestPayload({
    url: "/cdn/operate/toolLink/list",
    method: "GET",
    requestTarget: "ServeCDN",
  });
}
