import { invoke } from "@tauri-apps/api";

/**
 * Response object.
 *
 * @since 1.0.0
 * */
export interface Response<T> {
  /** The request URL. */
  url: string;
  /** The response status code. */
  status: number;
  /** A boolean indicating whether the response was successful (status in the range 200–299) or not. */
  ok: boolean;
  /** The response headers. */
  headers: Record<string, string>;
  /** The response raw headers. */
  rawHeaders: Record<string, string[]>;
  /** The response data. */
  data: T;
}

/** The request HTTP verb. */
export type HttpVerb =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "TRACE";

/**
 * @since 1.0.0
 */
export enum ResponseType {
  JSON = 1,
  Text = 2,
  Binary = 3,
}

const BASE_URL: Record<string, string> = {
  SERVER_URL: "https://server.ceobecanteen.top/api/v1",
  CDN_URL: "https://cdn.ceobecanteen.top",
  CDN_SERVER_URL: "https://server-cdn.ceobecanteen.top/api/v1",
};
const showStatus = (status: number) => {
  let message: string;
  switch (status) {
    case 400: {
      message = "请求错误(400)";
      break;
    }
    case 401: {
      message = "未授权，请重新登录(401)";
      break;
    }
    case 402: {
      message = "拒绝访问(402)";
      break;
    }
    case 404: {
      message = "请求出错(404)";
      break;
    }
    case 408: {
      message = "请求超时(408)";
      break;
    }
    case 500: {
      message = "服务器错误(500)";
      break;
    }
    case 501: {
      message = "服务未实现(501)";
      break;
    }
    case 502: {
      message = "网络错误(502)";
      break;
    }
    case 503: {
      message = "服务不可用(503)";
      break;
    }
    case 504: {
      message = "网络超时(504)";
      break;
    }
    case 505: {
      message = "HTTP版本不受支持(505)";
      break;
    }
    default: {
      message = `连接出错(${status})!`;
    }
  }
  return `${message}，请检查网络或联系管理员！`;
};

export interface RequestOptions {
  requestTarget?: "Server" | "CDN" | "ServeCDN";
  method: HttpVerb;
  url: string;
  headers?: Record<string, any>;
  query?: Record<string, any>;
  body?: any;
  timeout?: number;
  responseType?: ResponseType;
}

class RequestClient {
  constructor() {}

  async requestPayload<T>(
    options: RequestOptions,
  ): Promise<Response<Payload<T>>> {
    const response: Response<Payload<T>> =
      await this.request<Payload<T>>(options);
    if (response.data.code === "00000") {
      return response;
    } else {
      throw new Error(
        `${response.data.code}:${response.data.message} | ${response.data.msg}`,
      );
    }
  }
  async request<T>(options: RequestOptions): Promise<Response<T>> {
    let base;

    switch (options.requestTarget) {
      case "Server": {
        base = BASE_URL.SERVER_URL;

        break;
      }
      case "CDN": {
        base = BASE_URL.CDN_URL;

        break;
      }
      case "ServeCDN": {
        base = BASE_URL.CDN_SERVER_URL;

        break;
      }
      default: {
        base = BASE_URL.SERVER_URL;
      }
    }

    options.url = `${base}${options.url}`;

    try {
      console.log(`sending request`);
      console.log(options);

      const response: Response<T> = await invoke("send_request", {
        options,
      });

      const status = response.status;
      let msg = "";
      if (status < 200 || (status >= 300 && status !== 401 && status !== 500)) {
        // 处理http错误，抛到业务代码
        msg = showStatus(status);
        response.data =
          typeof response.data === "string"
            ? (msg as T)
            : {
                ...response.data,
                msg,
              };
        return response;
      } else if (status === 200) {
        return response;
      } else if (status === 500) {
        msg = showStatus(status);
        response.data = { msg } as T;
        return response;
      }
      throw new Error(`未知错误，状态码：${status}`);
    } catch (error: any) {
      console.error(error);
      error.message = "请求超时或服务器异常，请检查网络或联系管理员！";
      // 错误抛到业务代码
      throw error;
    }
  }
}

const requestClient = new RequestClient();

export default requestClient;

export interface Payload<T> {
  code: string;
  msg: string;
  message: string;
  data: T;
}
