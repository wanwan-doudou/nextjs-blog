"use client";

import { useCallback, useSyncExternalStore } from "react";

// SSR 阶段拿不到 window，统一按未命中处理，与客户端水合首帧保持一致；
// 水合完成后 React 会用 getSnapshot 的真实值校正
const getServerSnapshot = () => false;

/**
 * 订阅 CSS 媒体查询，视口跨断点时自动更新。
 * 相比在 effect 里读一次 matchMedia().matches，这里会跟随 resize 变化。
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
