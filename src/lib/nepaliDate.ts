import NepaliDate from "nepali-date-converter";

export type BsParts = { year: string; month: string; day: string };

const AD_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kathmandu",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const toPadded = (value: number | string, size = 2) =>
  String(value).padStart(size, "0");

export const getBikramSambatParts = (now: Date): BsParts => {
  const adInNepal = AD_FORMATTER.format(now);
  const [adYear, adMonth, adDay] = adInNepal.split("-").map(Number);
  const adDateLocal = new Date(adYear, adMonth - 1, adDay, 12);
  const bs = new NepaliDate(adDateLocal).getBS();

  const bsMonth = typeof bs.month === "number" ? bs.month + 1 : bs.month;
  return {
    year: String(bs.year ?? ""),
    month: toPadded(bsMonth ?? ""),
    day: toPadded(bs.date ?? ""),
  };
};
