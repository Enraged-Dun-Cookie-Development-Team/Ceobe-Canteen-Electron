interface ToolInfo {
  url: string;
  name: string;
  img: string;
  radius: boolean;
}

const toolInfo = [
  {
    url: "http://prts.wiki/",
    name: "PRTS.Wiki",
    img: "/assets/image/link/akwiki.png",
    radius: true,
  },
  {
    url: "https://mapcn.ark-nights.com",
    name: "PRTS.Map",
    img: "/assets/image/link/akmap.ico",
    radius: true,
  },
  {
    url: "https://penguin-stats.cn/",
    name: "企鹅物流",
    img: "/assets/image/link/penguin_stats_logo.webp",
    radius: true,
  },
  {
    url: "https://arkn.lolicon.app/#/",
    name: "明日方舟工具箱",
    img: "/assets/image/link/arktools.png",
    radius: true,
  },
  {
    url: "https://kokodayo.fun/",
    name: "Kokodayo",
    img: "/assets/image/link/kkdy.png",
    radius: true,
  },
  {
    url: "https://aog.wiki/",
    name: "刷素材一图流",
    img: "/assets/image/link/akgraph.ico",
    radius: true,
  },
  {
    url: "https://viktorlab.cn/akdata/",
    name: "Arknight DPS",
    img: "/assets/image/link/dps.ico",
    radius: true,
  },
  {
    url: "https://terrach.net/",
    name: "泰拉通讯枢纽",
    img: "/assets/image/link/tltxsn.png",
    radius: false,
  },
  {
    url: "../time.html",
    name: "小刻食堂计时器",
    img: "/assets/image/logo/icon.png",
    radius: false,
  },
];

interface SourceInfo {
  url: string;
  name: string;
  img: string;
  radius?: boolean;
}

const sourceInfo: SourceInfo[] = [
  {
    url: "https://ak.hypergryph.com/#information",
    name: "官网",
    img: "/assets/image/icon/mrfz.ico",
  },
  {
    url: "https://space.bilibili.com/161775300/dynamic",
    name: "官方B站动态",
    img: "/assets/image/icon/bili.ico",
  },
  {
    url: "https://weibo.com/arknights",
    name: "官方微博",
    img: "/assets/image/icon/weibo.ico",
  },
  {
    url: "https://space.bilibili.com/1265652806/dynamic",
    name: "明日方舟终末地",
    img: "/assets/image/icon/arkzmd.jpg",
  },
  {
    url: "https://weibo.com/u/6441489862",
    name: "朝陇山微博",
    img: "/assets/image/icon/cho3Weibo.jpg",
    radius: true,
  },
  {
    url: "https://weibo.com/u/7506039414",
    name: "一拾山微博",
    img: "/assets/image/icon/ys3Weibo.jpg",
    radius: true,
  },
  {
    url: "https://monster-siren.hypergryph.com/",
    name: "塞壬唱片官网",
    img: "/assets/image/icon/sr.ico",
    radius: true,
  },
  {
    url: "https://monster-siren.hypergryph.com/",
    name: "塞壬唱片网易云音乐",
    img: "/assets/image/icon/wyyyy.ico",
    radius: true,
  },
  {
    url: "https://weibo.com/u/7499841383",
    name: "泰拉记事社微博",
    img: "/assets/image/icon/tlWeibo.jpg",
    radius: true,
  },
  {
    url: "https://terra-historicus.hypergryph.com/",
    name: "泰拉记事社官网",
    img: "/assets/image/icon/tl.jpg",
    radius: true,
  },
  {
    url: "https://weibo.com/u/7461423907",
    name: "鹰角网络微博",
    img: "/assets/image/icon/yjwb.jpg",
    radius: true,
  },
  {
    url: "https://ak.hypergryph.com/anime",
    name: "明日方舟动画官网",
    img: "/assets/image/icon/anime.png",
    radius: true,
  },
  {
    url: "https://ak.hypergryph.com/anime",
    name: "游戏内公告",
    img: "/assets/image/icon/txz.jpg",
    radius: true,
  },
];

interface DayInfo {
  type: number;
  name: string;
  day: number[];
  src: string;
}

const dayInfo: DayInfo[] = [
  {
    type: 1,
    name: "高级作战记录",
    day: [1, 2, 3, 4, 5, 6, 0],
    src: "/assets/image/game/LS.png",
  },
  {
    type: 2,
    name: "龙门币",
    day: [2, 4, 6, 0],
    src: "/assets/image/game/CE.png",
  },
  {
    type: 3,
    name: "采购凭证",
    day: [1, 4, 6, 0],
    src: "/assets/image/game/AP.png",
  },
  {
    type: 4,
    name: "碳素",
    day: [1, 3, 5, 6],
    src: "/assets/image/game/SK.png",
  },
  {
    type: 5,
    name: "技巧概要",
    day: [2, 3, 5, 0],
    src: "/assets/image/game/CA.png",
  },
  {
    type: 6,
    name: "摧枯拉朽",
    day: [1, 2, 5, 6],
    src: "/assets/image/game/PRB.png",
  },
  {
    type: 7,
    name: "身先士卒",
    day: [2, 3, 6, 0],
    src: "/assets/image/game/PRD.png",
  },
  {
    type: 8,
    name: "固若金汤",
    day: [1, 4, 5, 0],
    src: "/assets/image/game/PRA.png",
  },
  {
    type: 9,
    name: "势不可当",
    day: [3, 4, 6, 0],
    src: "/assets/image/game/PRC.png",
  },
];

export { toolInfo, sourceInfo, dayInfo };
export type { ToolInfo, SourceInfo, DayInfo };
