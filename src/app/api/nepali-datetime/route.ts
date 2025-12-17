import { NextResponse } from "next/server";
import { ADToBS } from "bikram-sambat-js";

function getBikramSambatParts(now: Date) {
  const adInNepal = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const bs = ADToBS(adInNepal);
  const [year = "", month = "", day = ""] = bs.split("-");
  return { year, month, day };
}

export async function GET() {
  const now = new Date();
  const bs = getBikramSambatParts(now);

  return NextResponse.json({
    bs,
    asOf: now.toISOString(),
  });
}
