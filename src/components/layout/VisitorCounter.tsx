"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

type CountApiResponse = {
  value?: number;
};

const COUNT_API_BASE_URL = "https://api.countapi.xyz";
const COUNTER_KEY = "site-visits";

function buildNamespace() {
  if (typeof window === "undefined") {
    return "nextjs-blog";
  }

  return window.location.hostname.replace(/[^a-zA-Z0-9-]/g, "-") || "nextjs-blog";
}

function getSessionFlag(flagKey: string) {
  try {
    return window.sessionStorage.getItem(flagKey) === "1";
  } catch {
    return false;
  }
}

function setSessionFlag(flagKey: string) {
  try {
    window.sessionStorage.setItem(flagKey, "1");
  } catch {
    // Ignore storage errors in restricted browser contexts.
  }
}

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchVisitorCount = async () => {
      const namespace = buildNamespace();
      const sessionFlag = `visitor-counter:${namespace}:${COUNTER_KEY}`;
      const hasCountedInSession = getSessionFlag(sessionFlag);
      const action = hasCountedInSession ? "get" : "hit";
      const url = `${COUNT_API_BASE_URL}/${action}/${encodeURIComponent(namespace)}/${encodeURIComponent(COUNTER_KEY)}`;

      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Count API request failed.");
        }

        const data = (await response.json()) as CountApiResponse;
        if (typeof data.value !== "number") {
          throw new Error("Invalid Count API response.");
        }

        if (cancelled) {
          return;
        }

        setCount(data.value);
        if (!hasCountedInSession) {
          setSessionFlag(sessionFlag);
        }
      } catch {
        if (!cancelled) {
          setCount(null);
        }
      }
    };

    void fetchVisitorCount();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-1 text-white/60 text-sm">
      <Eye className="h-4 w-4" aria-hidden />
      <span>访问量：{count ?? "--"}</span>
    </div>
  );
}
