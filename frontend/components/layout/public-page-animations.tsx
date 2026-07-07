"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PublicPageAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-public-page]");
    if (!root) return;

    const timers: number[] = [];
    const animationFrames: number[] = [];
    const main = root.querySelector<HTMLElement>("main");
    const isHomePage = Boolean(main?.hasAttribute("data-home-page"));
    root.dataset.publicAnimationsReady = "true";

    const selector = isHomePage
      ? "footer [data-public-reveal], footer .mx-auto"
      : [
          "main section > .mx-auto",
          "main section article",
          "main section aside",
          "main section form",
          "main [data-public-reveal]",
          "footer [data-public-reveal]",
          "footer .mx-auto",
        ].join(",");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const frame = window.requestAnimationFrame(() => {
            entry.target.classList.add("is-visible");
          });
          animationFrames.push(frame);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      },
    );

    const registerTargets = () => {
      const targets = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((target) => {
        if (isHomePage && target.closest("[data-home-page]")) return false;
        return !target.classList.contains("public-reveal");
      });

      targets.forEach((target, index) => {
        target.classList.add("public-reveal");
        target.style.transitionDelay = `${Math.min((index % 7) * 65, 390)}ms`;

        const rect = target.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          const timer = window.setTimeout(() => {
            const frame = window.requestAnimationFrame(() => {
              target.classList.add("is-visible");
            });
            animationFrames.push(frame);
          }, 90);
          timers.push(timer);
          return;
        }

        observer.observe(target);
      });
    };

    registerTargets();

    const mutationObserver = new MutationObserver(() => registerTargets());
    mutationObserver.observe(root, { childList: true, subtree: true });

    const fallbackTimer = window.setTimeout(() => {
      root.querySelectorAll<HTMLElement>(".public-reveal").forEach((target) => {
        target.classList.add("is-visible");
      });
    }, 1800);
    timers.push(fallbackTimer);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      animationFrames.forEach((frame) => window.cancelAnimationFrame(frame));
      delete root.dataset.publicAnimationsReady;
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
