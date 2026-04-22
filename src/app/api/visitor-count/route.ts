import { NextResponse } from "next/server";

type CountApiResponse = {
  value?: number;
};

const COUNT_API_BASE_URL = "https://countapi.mileshilliard.com/api/v1";
const COUNTER_KEY = "site-visits";

function sanitizeNamespace(input?: string | null) {
  return input?.replace(/[^a-zA-Z0-9-]/g, "-") || "nextjs-blog";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") === "hit" ? "hit" : "get";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  const namespace = sanitizeNamespace(forwardedHost ?? host ?? url.hostname);
  const key = `${namespace}-${COUNTER_KEY}`;

  try {
    const response = await fetch(`${COUNT_API_BASE_URL}/${action}/${encodeURIComponent(key)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Count API request failed.");
    }

    const data = (await response.json()) as CountApiResponse;
    if (typeof data.value !== "number") {
      throw new Error("Invalid Count API response.");
    }

    return NextResponse.json({ value: data.value });
  } catch {
    return NextResponse.json(
      { error: "Visitor count unavailable." },
      { status: 502 }
    );
  }
}
