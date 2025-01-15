import requestClient, { Payload, Response } from "@/utils/requestUtil";

export interface ReleaseVersion {
  /**
   * 是否弃用，默认情况下，该参数不需提供
   */
  deleted: boolean;
  /**
   * 发布版本描述，如果未提供，该字段获得时会跳过序列化
   */
  description?: string;
  /**
   * 可用下载源
   */
  download_source: DownloadSource[];
  /**
   * 发布目标平台，- Desktop: 桌面端
   * - Pocket: 移动端
   * - Plugin： 插件端
   */
  platform: ReleasePlatform;
  /**
   * 前一个强制版本
   */
  previous_mandatory_version: string;
  /**
   * 发布的新版本
   */
  version: string;
}

export interface DownloadSource {
  /**
   * 下载源描述
   */
  description?: string;
  /**
   * 下载源名称
   */
  name: string;
  /**
   * 主要下载链接
   */
  primary_url: PrimaryUrl;
  /**
   * 备用下载链接，如果没有任何备用下载链接，这个字段将不会被序列化
   */
  spare_urls?: SpareUrl[];
}

/**
 * 主要下载链接
 */
export interface PrimaryUrl {
  /**
   * 是否为手动下载链接
   */
  manual: boolean;
  /**
   * 在Primary中的URL的name为可选填写，如果需要填写需要为“Primary"”
   */
  name?: Name;
  /**
   * 支持的平台
   */
  support_platforms?: SupportPlatform[];
  /**
   * 下载链接
   */
  url: string;
}

export function primaryToSpare(primary_url: PrimaryUrl): SpareUrl {
  return {
    manual: primary_url.manual,
    name: primary_url.name ?? "Primary",
    url: primary_url.url,
    support_platforms: primary_url.support_platforms,
  };
}

export enum Name {
  Primary = "Primary",
}

/**
 * Support Platform
 */
export enum SupportPlatform {
  Android = "Android",
  BrowserZIP = "BrowserZIP",
  Chrome = "Chrome",
  Edge = "Edge",
  Firefox = "Firefox",
  Harmony = "Harmony",
  Ie = "IE",
  Ios = "Ios",
  Linux = "Linux",
  MacOS = "MacOS",
  Safari = "Safari",
  Webkit = "Webkit",
  WindowsPhone = "WindowsPhone",
}

export interface SpareUrl {
  /**
   * 是否为手动下载链接
   */
  manual: boolean;
  /**
   * 备用下载名，备用下载链接名为必填
   */
  name: string;
  /**
   * 支持的平台
   */
  support_platforms?: SupportPlatform[];
  /**
   * 下载链接
   */
  url: string;
}

/**
 * 发布目标平台，- Desktop: 桌面端
 * - Pocket: 移动端
 * - Plugin： 插件端
 *
 * 发布版本平台
 */
export enum ReleasePlatform {
  Desktop = "desktop",
  Plugin = "plugin",
  Pocket = "pocket",
}

export function getVersion(
  version?: string,
): Promise<Response<Payload<ReleaseVersion>>> {
  return requestClient.requestPayload({
    url: "/cdn/operate/version/fetch",
    method: "GET",
    query: {
      version,
      platform: "desktop",
    },
    requestTarget: "ServeCDN",
  });
}

export interface VersionList {
  list: ReleaseVersion[];
  next_id?: string;
}

export function getAllVersion(
  firstId?: string,
): Promise<Response<Payload<VersionList>>> {
  const query = firstId
    ? {
        first_id: firstId,
        platform: "desktop",
      }
    : {
        platform: "desktop",
      };
  return requestClient.requestPayload({
    url: "/cdn/operate/version/fetch",
    method: "GET",
    query,
    requestTarget: "ServeCDN",
  });
}
