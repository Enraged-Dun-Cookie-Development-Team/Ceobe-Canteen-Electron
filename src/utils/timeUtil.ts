import { DateTime } from "luxon";
function transformDate(dateValue: number | string | Date): Date {
  if (typeof dateValue !== "object" || dateValue.constructor !== Date) {
    dateValue = new Date(dateValue);
  }
  return dateValue;
}

/**
 * 格式化Date，支持yyyy-MM-dd hh:mm:ss
 */
export function format(date: number | string | Date, formatText: string) {
  const dateConv: Date = transformDate(date);
  const o: Record<string, number> = {
    //月份
    "M+": dateConv.getMonth() + 1, //日
    "d+": dateConv.getDate(), //小时
    "h+": dateConv.getHours(), //分
    "m+": dateConv.getMinutes(), //秒
    "s+": dateConv.getSeconds(), // 季度和毫秒的格式化：可以支持，但没必要
    // //季度
    // "q+": Math.floor((date.getMonth() + 3) / 3),
    // //毫秒
    // "S": date.getMilliseconds()
  };

  if (/(y+)/.test(formatText)) {
    formatText = formatText.replace(
      RegExp.$1,
      `${dateConv.getFullYear()}`.slice(4 - RegExp.$1.length),
    );
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(formatText)) {
      formatText = formatText.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k].toString()
          : `00${o[k]}`.slice(`${o[k]}`.length),
      );
    }
  }
  return formatText;
}

/**
 * 计算并格式化两个Date的差值，如果startDate >= endDate会返回空值
 */
export function calcDiff(
  endTimestamp: number,
  startTimestamp = DateTime.local().valueOf(),
) {
  if (startTimestamp >= endTimestamp) {
    return "";
  }

  const timeUnits = new Map([
    [24 * 3600 * 1000, "天"],
    [3600 * 1000, "小时"],
    [60 * 1000, "分钟"],
  ]);
  let text = "";
  let time = Math.abs(endTimestamp - startTimestamp);
  for (const unit of timeUnits) {
    if (time >= unit[0]) {
      const num = Math.floor(time / unit[0]);
      text += `${num}${unit[1]}`;
      time %= unit[0];
    }
  }
  return text || "0分钟";
}

/**
 * 将时间转换为中国时区 GMT+8
 */
export function changeToCCT(date: Date) {
  const localTime = date.getTime();
  const localOffset = date.getTimezoneOffset() * 60_000;
  const utc = localTime + localOffset;
  const cct = utc + 3_600_000 * 8;
  return new Date(cct);
}

export function numberToWeek(x: number) {
  switch (x) {
    case 0: {
      return "星期天";
    }
    case 1: {
      return "星期一";
    }
    case 2: {
      return "星期二";
    }
    case 3: {
      return "星期三";
    }
    case 4: {
      return "星期四";
    }
    case 5: {
      return "星期五";
    }
    case 6: {
      return "星期六";
    }
    default: {
      return "无效";
    }
  }
}

/**
 * 时间相加 不支持负数
 * @param h
 * @param m
 * @param s
 */
export function dateAddTime(h: string, m: string, s: string) {
  const date = new Date();
  date.setHours(date.getHours() + Number.parseInt(h));
  date.setMinutes(date.getMinutes() + Number.parseInt(m));
  date.setSeconds(date.getSeconds() + Number.parseInt(s));
  return new Date(date);
}

export function secondToDate(result: number) {
  const m = Math.floor((result / 60) % 60);
  const s = Math.floor(result % 60);
  return `${m}:${s}`;
}
