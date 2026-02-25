"use client";

import { useEffect, useRef } from "react";

export function PostContent({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest(".copy-btn");
      if (!button) return;

      const wrapper = button.closest(".code-block-wrapper");
      if (!wrapper) return;

      const codeElement = wrapper.querySelector("code");
      if (!codeElement) return;

      try {
        await navigator.clipboard.writeText(codeElement.innerText);

        // 保存原始图标（如果还没被修改过）
        const originalHTML = button.getAttribute("data-original-html") || button.innerHTML;
        if (!button.getAttribute("data-original-html")) {
          button.setAttribute("data-original-html", originalHTML);
        }

        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-green-400">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <span class="text-green-400">已复制</span>
        `;

        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    };

    const container = contentRef.current;
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <article
      ref={contentRef}
      className="prose-gal"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
