import { getHasRefererImageBase64, getLocalFileText } from "../function";
import { getAnnouncementInfo } from "../resourceFetcher/announcement";
import { getCardList } from "../resourceFetcher/cardList";
import { getCookieList } from "../resourceFetcher/cookieList";
import { getDatasourceComb } from "../resourceFetcher/datasourceCombine";
import { getConfigDatasourceList } from "../resourceFetcher/datasourceList";
import { getCookieNewestInfo } from "../resourceFetcher/newestCookie";
import { getResourceInfo } from "../resourceFetcher/resource";

class CeobeRequest {
  getCardList = getCardList;
  getResourceList = getConfigDatasourceList;
  getDatasourceComb = getDatasourceComb;
  getDatasourceCombList = getCookieNewestInfo;
  getCookieList = getCookieList;
  getAnnouncementInfo = getAnnouncementInfo;
  getResourceInfo = getResourceInfo;

  getHasRefererImageBase64 = getHasRefererImageBase64;

  getLocalFileText = getLocalFileText;
}

const ceobeRequest = new CeobeRequest();

export default ceobeRequest;
