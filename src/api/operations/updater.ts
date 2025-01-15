import { app } from "@tauri-apps/api";

import { getVersion } from "../resourceFetcher/version";

class Updater {
  async judgmentVersion(newer: string) {
    const v1 = newer;
    const v2 = await app.getVersion();
    console.log(v1);
    console.log(v2);
    if (v1 === v2) {
      return false;
    }

    const vs1 = v1.split(".").map((a: string) => Number.parseInt(a));
    const vs2 = v2.split(".").map((a) => Number.parseInt(a));

    const digit = Math.min(vs1.length, vs2.length);
    for (let i = 0; i < digit; i++) {
      if (vs1[i] > vs2[i]) {
        return true;
      } else if (vs1[i] < vs2[i]) {
        return false;
      }
    }

    return digit !== vs1.length;
  }

  async checkUpdate(): Promise<boolean> {
    const newer = await getVersion();
    return newer.data.data
      ? await this.judgmentVersion(newer.data.data.version)
      : false;
  }
}
export enum VersionStateType {
  Newest = "Newest",
  UpdateAvailable = "UpdateAvailable",
  Unknown = "Unknown",
}
const updater = new Updater();
export default updater;
