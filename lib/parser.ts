import type { BabyRecord, RecordType } from "@/lib/types";
import {
  BREAST_SIDE_WORDS,
  PEE_POOP_COMBO_WORDS,
  SMART_RECORD_RULES,
} from "@/lib/smartRules";

type ParseResult = {
  records: BabyRecord[];
  failed: string[];
};

type DateInfo = {
  raw: string;
  date: Date;
};

type TimeInfo = {
  raw: string;
  hour: number;
  minute: number;
  date: Date;
};

const FUTURE_TOLERANCE_MS = 2 * 60 * 1000;

function id() {
  return crypto.randomUUID();
}

function createdAt() {
  return new Date().toISOString();
}

function cloneDateOnly(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function makeDateTime(baseDate: Date, hour: number, minute: number) {
  const d = new Date(baseDate);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function makeRelativeDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d;
}

function makeMonthDayDate(month: number, day: number) {
  const d = new Date();
  d.setMonth(month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function makeFullDate(year: number, month: number, day: number) {
  const d = new Date();
  d.setFullYear(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isValidDateParts(year: number, month: number, day: number) {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const d = makeFullDate(year, month, day);

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

function isFutureTime(date: Date) {
  return date.getTime() > Date.now() + FUTURE_TOLERANCE_MS;
}

function normalizeFutureTimeWithoutExplicitDate(
  date: Date,
  hasExplicitDate: boolean
) {
  if (hasExplicitDate) return date;

  if (isFutureTime(date)) {
    const fixed = new Date(date);
    fixed.setDate(fixed.getDate() - 1);
    return fixed;
  }

  return date;
}

function findDate(text: string): DateInfo | null {
  if (/后天/.test(text)) {
    return {
      raw: "后天",
      date: makeRelativeDate(2),
    };
  }

  if (/明天/.test(text)) {
    return {
      raw: "明天",
      date: makeRelativeDate(1),
    };
  }

  if (/前天/.test(text)) {
    return {
      raw: "前天",
      date: makeRelativeDate(-2),
    };
  }

  if (/昨天/.test(text)) {
    return {
      raw: "昨天",
      date: makeRelativeDate(-1),
    };
  }

  if (/今天/.test(text)) {
    return {
      raw: "今天",
      date: makeRelativeDate(0),
    };
  }

  const fullDate = text.match(
    /(\d{4})(?:年|[\/\-.])(\d{1,2})(?:月|[\/\-.])(\d{1,2})(?:日|号)?/
  );

  if (fullDate) {
    const year = Number(fullDate[1]);
    const month = Number(fullDate[2]);
    const day = Number(fullDate[3]);

    if (!isValidDateParts(year, month, day)) return null;

    return {
      raw: fullDate[0],
      date: makeFullDate(year, month, day),
    };
  }

  const monthDayChinese = text.match(/(\d{1,2})月(\d{1,2})(?:日|号)?/);

  if (monthDayChinese) {
    const year = new Date().getFullYear();
    const month = Number(monthDayChinese[1]);
    const day = Number(monthDayChinese[2]);

    if (!isValidDateParts(year, month, day)) return null;

    return {
      raw: monthDayChinese[0],
      date: makeMonthDayDate(month, day),
    };
  }

  const monthDayNumber = text.match(
    /(^|[^\d])(\d{1,2})[\/\-.](\d{1,2})(?=$|[^\d])/
  );

  if (monthDayNumber) {
    const year = new Date().getFullYear();
    const month = Number(monthDayNumber[2]);
    const day = Number(monthDayNumber[3]);

    if (!isValidDateParts(year, month, day)) return null;

    return {
      raw: monthDayNumber[0].trim(),
      date: makeMonthDayDate(month, day),
    };
  }

  return null;
}

function findRelativeTime(text: string): TimeInfo | null {
  const now = new Date();

  const current = text.match(/刚刚|现在/);
  if (current) {
    return {
      raw: current[0],
      hour: now.getHours(),
      minute: now.getMinutes(),
      date: now,
    };
  }

  if (/半小时前/.test(text)) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 30);

    return {
      raw: "半小时前",
      hour: d.getHours(),
      minute: d.getMinutes(),
      date: d,
    };
  }

  const minuteAgo = text.match(/(\d{1,3})\s*分钟前/);
  if (minuteAgo) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - Number(minuteAgo[1]));

    return {
      raw: minuteAgo[0],
      hour: d.getHours(),
      minute: d.getMinutes(),
      date: d,
    };
  }

  const hourAgo = text.match(/(\d{1,2})\s*小时前/);
  if (hourAgo) {
    const d = new Date();
    d.setHours(d.getHours() - Number(hourAgo[1]));

    return {
      raw: hourAgo[0],
      hour: d.getHours(),
      minute: d.getMinutes(),
      date: d,
    };
  }

  return null;
}

function findTime(text: string, baseDate: Date): TimeInfo | null {
  const relative = findRelativeTime(text);
  if (relative) return relative;

  const colon = text.match(/(\d{1,2})[:：](\d{1,2})/);

  if (colon) {
    const hour = Number(colon[1]);
    const minute = Number(colon[2]);

    if (hour > 23 || minute > 59) return null;

    return {
      raw: colon[0],
      hour,
      minute,
      date: makeDateTime(baseDate, hour, minute),
    };
  }

  const chinese = text.match(/(\d{1,2})点(?:(半)|(\d{1,2})分?|整)?/);

  if (chinese) {
    const hour = Number(chinese[1]);
    const minute = chinese[2] ? 30 : chinese[3] ? Number(chinese[3]) : 0;

    if (hour > 23 || minute > 59) return null;

    return {
      raw: chinese[0],
      hour,
      minute,
      date: makeDateTime(baseDate, hour, minute),
    };
  }

  return null;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasAnyWord(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function getWordsByType(type: Exclude<RecordType, "other">) {
  return SMART_RECORD_RULES.filter((rule) => rule.type === type).flatMap(
    (rule) => rule.words
  );
}

function getPeeWords() {
  return getWordsByType("pee");
}

function getPoopWords() {
  return getWordsByType("poop");
}

function makeWordsPattern(words: string[]) {
  return words.map(escapeRegExp).join("|");
}

function splitEvents(input: string) {
  const peePattern = makeWordsPattern(getPeeWords());
  const poopPattern = makeWordsPattern(getPoopWords());

  return input
    .replace(/\s+/g, " ")
    .split(/[，,、；;\n]+/g)
    .flatMap((part) => {
      const trimmed = part.trim();

      if (!trimmed) return [];

      if (hasAnyWord(trimmed, PEE_POOP_COMBO_WORDS)) {
        return [trimmed];
      }

      return trimmed
        .split(
          new RegExp(
            `(?<=${peePattern})\\s+(?=${poopPattern})|(?<=${poopPattern})\\s+(?=${peePattern})`,
            "g"
          )
        )
        .map((s) => s.trim())
        .filter(Boolean);
    })
    .filter(Boolean);
}

function stripDate(text: string) {
  return text
    .replace(/后天|明天|前天|昨天|今天/g, "")
    .replace(
      /\d{4}(?:年|[\/\-.])\d{1,2}(?:月|[\/\-.])\d{1,2}(?:日|号)?/g,
      ""
    )
    .replace(/\d{1,2}月\d{1,2}(?:日|号)?/g, "")
    .replace(/(^|[^\d])\d{1,2}[\/\-.]\d{1,2}(?=$|[^\d])/g, "$1")
    .trim();
}

function stripTime(text: string) {
  return text
    .replace(/刚刚|现在|半小时前|\d{1,3}\s*分钟前|\d{1,2}\s*小时前/g, "")
    .replace(/\d{1,2}[:：]\d{1,2}/g, "")
    .replace(/\d{1,2}点(?:(半)|(\d{1,2})分?|整)?/g, "")
    .trim();
}

function stripDateTime(text: string) {
  return stripTime(stripDate(text)).trim();
}

function isPeePoopCombo(text: string) {
  const peeWords = getWordsByType("pee");
  const poopWords = getWordsByType("poop");

  return (
    hasAnyWord(text, PEE_POOP_COMBO_WORDS) ||
    (hasAnyWord(text, peeWords) && hasAnyWord(text, poopWords))
  );
}

function detectType(text: string): RecordType | null {
  if (isPeePoopCombo(text)) return "poop";

  for (const rule of SMART_RECORD_RULES) {
    if (hasAnyWord(text, rule.words)) {
      return rule.type;
    }
  }

  if (/左(?:侧|边)?\s*\d+|右(?:侧|边)?\s*\d+/.test(text)) {
    return "breast";
  }

  if (
    /(?:左右两边|左右|两边|双边|两侧|双侧)\s*各\s*\d+(?:\.\d+)?\s*(分钟|分|min)?/i.test(
      text
    )
  ) {
    return "breast";
  }

  return null;
}

function extractAmount(text: string) {
  const cleaned = stripDateTime(text);

  const ml = cleaned.match(/(\d+(?:\.\d+)?)\s*(ml|毫升)/i);
  if (ml) return Number(ml[1]);

  const bare = cleaned.match(/(\d+(?:\.\d+)?)/);
  return bare ? Number(bare[1]) : undefined;
}

function extractDuration(text: string) {
  const cleaned = stripDateTime(text);
  const m = cleaned.match(/(\d+(?:\.\d+)?)\s*(分钟|分|min)/i);
  return m ? Number(m[1]) : undefined;
}

function extractBreast(text: string) {
  const bothSides = text.match(
    /(?:左右两边|左右|两边|双边|两侧|双侧)\s*各\s*(\d+(?:\.\d+)?)\s*(分钟|分|min)?/i
  );

  if (bothSides) {
    const eachMin = Number(bothSides[1]);

    return {
      leftMin: eachMin,
      rightMin: eachMin,
      durationMin: eachMin * 2,
    };
  }

  const leftWords = BREAST_SIDE_WORDS.left.map(escapeRegExp).join("|");
  const rightWords = BREAST_SIDE_WORDS.right.map(escapeRegExp).join("|");

  const left = text.match(
    new RegExp(`(?:${leftWords})\\s*(\\d+(?:\\.\\d+)?)`)
  );

  const right = text.match(
    new RegExp(`(?:${rightWords})\\s*(\\d+(?:\\.\\d+)?)`)
  );

  const leftMin = left ? Number(left[1]) : undefined;
  const rightMin = right ? Number(right[1]) : undefined;

  return {
    leftMin,
    rightMin,
    durationMin:
      leftMin || rightMin
        ? (leftMin || 0) + (rightMin || 0)
        : extractDuration(text),
  };
}

function removeRuleWords(text: string) {
  let result = text;

  for (const word of PEE_POOP_COMBO_WORDS) {
    result = result.replace(new RegExp(escapeRegExp(word), "g"), "");
  }

  for (const rule of SMART_RECORD_RULES) {
    for (const word of rule.words) {
      result = result.replace(new RegExp(escapeRegExp(word), "g"), "");
    }
  }

  return result;
}

function cleanNote(text: string, type: RecordType) {
  let note = text;

  note = stripDateTime(note);

  note = note.replace(
    /(?:左右两边|左右|两边|双边|两侧|双侧)\s*各\s*\d+(?:\.\d+)?\s*(分钟|分|min)?/gi,
    ""
  );

  if (type !== "other") {
    note = removeRuleWords(note);
  }

  const leftWords = BREAST_SIDE_WORDS.left.map(escapeRegExp).join("|");
  const rightWords = BREAST_SIDE_WORDS.right.map(escapeRegExp).join("|");

  note = note.replace(
    new RegExp(
      `(?:${leftWords})\\s*\\d+(?:\\.\\d+)?\\s*(分钟|分|min)?`,
      "gi"
    ),
    ""
  );

  note = note.replace(
    new RegExp(
      `(?:${rightWords})\\s*\\d+(?:\\.\\d+)?\\s*(分钟|分|min)?`,
      "gi"
    ),
    ""
  );

  note = note.replace(/\d+(?:\.\d+)?\s*(ml|毫升|分钟|分|min)/gi, "");

  if (type === "formula" || type === "bottle_breast" || type === "pump") {
    note = note.replace(/^\d+(?:\.\d+)?$/, "");
  }

  note = note.replace(/[+＋]/g, "");
  note = note.replace(/\s+/g, " ").trim();

  return note || undefined;
}

function makeSimpleRecord({
  type,
  time,
  content,
  note,
}: {
  type: RecordType;
  time: Date;
  content?: string;
  note?: string;
}): BabyRecord {
  return {
    id: id(),
    type,
    time: time.toISOString(),
    createdAt: createdAt(),
    content,
    note,
  };
}

function makeOtherRecord(raw: string, time: Date): BabyRecord | null {
  const content = stripDateTime(raw).trim();

  if (!content) return null;

  return makeSimpleRecord({
    type: "other",
    time,
    content,
  });
}

function parsePart(
  raw: string,
  inheritedDate: Date,
  inheritedTime: Date
): BabyRecord[] | null {
  const dateInfo = findDate(raw);
  const baseDate = dateInfo?.date || inheritedDate;

  const timeInfo = findTime(raw, baseDate);

  let recordTime = timeInfo?.date || dateInfo?.date || inheritedTime;
  recordTime = normalizeFutureTimeWithoutExplicitDate(
    recordTime,
    Boolean(dateInfo)
  );

  if (isFutureTime(recordTime)) {
    return null;
  }

  const text = stripDateTime(raw);
  const type = detectType(text);

  if (!type) {
    const otherRecord = makeOtherRecord(raw, recordTime);
    return otherRecord ? [otherRecord] : null;
  }

  if (hasAnyWord(text, PEE_POOP_COMBO_WORDS)) {
    const note = cleanNote(text, "poop");

    return [
      makeSimpleRecord({
        type: "poop",
        time: recordTime,
        note,
      }),
      makeSimpleRecord({
        type: "pee",
        time: recordTime,
        note,
      }),
    ];
  }

  if (isPeePoopCombo(text)) {
    return [
      makeSimpleRecord({
        type: "poop",
        time: recordTime,
      }),
      makeSimpleRecord({
        type: "pee",
        time: recordTime,
      }),
    ];
  }

  const base = {
    id: id(),
    type,
    time: recordTime.toISOString(),
    createdAt: createdAt(),
    note: cleanNote(text, type),
  };

  if (type === "breast") {
    const breast = extractBreast(text);

    return [
      {
        ...base,
        ...breast,
      },
    ];
  }

  if (type === "formula" || type === "bottle_breast") {
    return [
      {
        ...base,
        amountMl: extractAmount(text),
      },
    ];
  }

  if (type === "pump") {
    return [
      {
        ...base,
        amountMl: extractAmount(text),
        durationMin: extractDuration(text),
      },
    ];
  }

  return [base];
}

export function parseSmartInputs(input: string): ParseResult {
  const parts = splitEvents(input);

  const records: BabyRecord[] = [];
  const failed: string[] = [];

  let inheritedDate = cloneDateOnly(new Date());
  let inheritedTime = new Date();

  for (const part of parts) {
    const dateInfo = findDate(part);

    if (dateInfo) {
      inheritedDate = dateInfo.date;
    }

    const timeInfo = findTime(part, inheritedDate);

    if (timeInfo) {
      const normalizedTime = normalizeFutureTimeWithoutExplicitDate(
        timeInfo.date,
        Boolean(dateInfo)
      );

      if (!isFutureTime(normalizedTime)) {
        inheritedTime = normalizedTime;
        inheritedDate = cloneDateOnly(normalizedTime);
      }
    } else if (dateInfo && !isFutureTime(dateInfo.date)) {
      inheritedTime = dateInfo.date;
    }

    const textWithoutDateTime = stripDateTime(part);

    if (!textWithoutDateTime) {
      continue;
    }

    const parsed = parsePart(part, inheritedDate, inheritedTime);

    if (parsed?.length) {
      records.push(...parsed);
    } else {
      failed.push(part);
    }
  }

  return { records, failed };
}

export function parseSmartInput(input: string) {
  return parseSmartInputs(input).records[0] || null;
}