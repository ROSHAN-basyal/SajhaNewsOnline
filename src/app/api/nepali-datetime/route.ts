import { NextResponse } from "next/server";
import { getBikramSambatParts } from "../../../lib/nepaliDate";

export async function GET() {
  const now = new Date();
  const bs = getBikramSambatParts(now);

  return NextResponse.json({
    bs,
    asOf: now.toISOString(),
  });
}
