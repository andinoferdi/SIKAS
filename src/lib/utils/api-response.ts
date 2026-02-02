import { NextResponse } from "next/server"

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: NO_CACHE_HEADERS })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: NO_CACHE_HEADERS })
}
