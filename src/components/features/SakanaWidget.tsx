"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import Script from "next/script";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SAKANA_SRC =
  "https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.js";

export function SakanaWidget() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const visible = siteConfig.sakanaWidget.enable && isDesktop;

  useEffect(() => {
    const host = hostRef.current;
    if (!visible || !scriptLoaded || !host) return;

    // oxlint-disable-next-line typescript/no-explicit-any
    const SakanaWidgetCtor = (window as any).SakanaWidget;
    if (typeof SakanaWidgetCtor !== "function") return;

    // 库的 mount() 会用一个复制了 id/class 的新节点替换挂载目标，因此只能喂给它
    // 一个 React 不托管的内层节点：若直接交出 React 渲染的节点，React 卸载时会因
    // 该节点已脱离文档而抛 NotFoundError，并中断整次 commit（连兄弟组件一起渲染失败）
    const slot = document.createElement("div");
    host.appendChild(slot);

    const instance = new SakanaWidgetCtor({ character: "takina" });
    instance.mount(slot);

    return () => {
      // 交还给库自己拆监听和动画循环，再清空容器，避免反复跨断点时堆积残留节点
      instance.unmount();
      host.replaceChildren();
    };
  }, [visible, scriptLoaded]);

  if (!visible) return null;

  const { position } = siteConfig.sakanaWidget;

  return (
    <>
      <div
        ref={hostRef}
        className="sakana-widget fixed z-30"
        style={{
          bottom: position.bottom,
          right: position.right,
        }}
      />
      <Script
        src={SAKANA_SRC}
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
    </>
  );
}
