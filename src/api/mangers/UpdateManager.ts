import {getAllVersion, getVersion, ReleaseVersion} from "@/api/resourceFetcher/version";
import {fa} from "vuetify/iconsets/fa";

class UpdateManager {

    async latestVersion(): Promise<ReleaseVersion | null> {
        try {

            const payload = await getVersion()
            return payload.data.data
        } catch (e) {
            alert(`出现异常： ${e}`)
            return null
        }
    }

    async targetVersion(version: string): Promise<ReleaseVersion | null> {
        try {
            const payload = await getVersion(version)
            return payload.data.data
        } catch (e) {
            alert(`出现异常： ${e}`)
            return null
        }
    }

    allVersion(): AllVersionIterator {
        return new AllVersionIterator()
    }
}

export class AllVersionIterator {
    nextId?: string;
    start: boolean = false;

    async* [Symbol.asyncIterator]() {
        while (true) {
            try {
                const payload = await getAllVersion(this.nextId)
                if (payload.data.data.next_id && this.start) {
                    break
                }
                this.start = true
                this.nextId = payload.data.data.next_id
                yield payload.data.data.list
            } catch (e) {
                alert(`出现异常： ${e}`)
                yield []
            }
        }
    }
}


const updateManager = new UpdateManager()
export default updateManager