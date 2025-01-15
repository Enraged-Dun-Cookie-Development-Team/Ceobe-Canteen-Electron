import { invoke } from "@tauri-apps/api";

class Logger {
  async call(
    level: "Debug" | "Info" | "Trace" | "Warn" | "Error",
    local: string,
    payload: Record<string, any>,
  ) {
    await invoke("front_logger", {
      level,
      local,
      payload,
    });
  }

  async info(local: string, payload: Record<string, any>) {
    await this.call("Info", local, payload);
  }

  async debug(local: string, payload: Record<string, any>) {
    await this.call("Debug", local, payload);
  }

  async trace(local: string, payload: Record<string, any>) {
    await this.call("Trace", local, payload);
  }

  async warn(local: string, payload: Record<string, any>) {
    await this.call("Warn", local, payload);
  }

  async error(local: string, payload: Record<string, any>) {
    await this.call("Error", local, payload);
  }
}

const logger = new Logger();

export default logger;
