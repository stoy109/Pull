"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

const motionQuery = "(prefers-reduced-motion: no-preference)";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const isWorkerRoute = pathname === "/worker" || pathname.startsWith("/worker/");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || isWorkerRoute) return;

    const media = gsap.matchMedia();
    media.add(motionQuery, () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      const formPage = root.querySelector<HTMLElement>(".form-page");

      if (formPage) {
        const shell =
          formPage.querySelector<HTMLElement>(".form-shell") ??
          formPage.firstElementChild;
        if (!shell) return;

        timeline.fromTo(
          shell,
          { autoAlpha: 0, y: 16, scale: 0.99 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            clearProps: "opacity,visibility,transform",
          },
        );

        const panels = shell.querySelectorAll<HTMLElement>(
          ".form-visual, .form-panel",
        );
        if (panels.length) {
          timeline.fromTo(
            panels,
            { autoAlpha: 0, x: 18 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.42,
              stagger: 0.08,
              clearProps: "opacity,visibility,transform",
            },
            "-=0.32",
          );
        }

        const content = shell.querySelector<HTMLElement>(".form-content");
        const details = content
          ? Array.from(content.children)
          : Array.from(shell.children).filter(
              (element) => !element.matches('input[type="hidden"]'),
            );
        if (details.length) {
          timeline.fromTo(
            details,
            { autoAlpha: 0, y: 10 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.34,
              stagger: 0.045,
              clearProps: "opacity,visibility,transform",
            },
            "-=0.24",
          );
        }
        return;
      }

      const dashboardLayout = root.querySelector<HTMLElement>("main > .grid");
      if (dashboardLayout) {
        const sidebar = dashboardLayout.firstElementChild;
        const workspace = dashboardLayout.lastElementChild;

        if (sidebar) {
          timeline.fromTo(
            sidebar,
            { autoAlpha: 0, x: -22 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.52,
              clearProps: "opacity,visibility,transform",
            },
          );
        }

        if (workspace) {
          const content = workspace.lastElementChild;
          const targets = [
            workspace.firstElementChild,
            ...(content ? Array.from(content.children) : []),
          ].filter(Boolean);

          timeline.fromTo(
            targets,
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.46,
              stagger: 0.055,
              clearProps: "opacity,visibility,transform",
            },
            sidebar ? "-=0.32" : 0,
          );
        }
        return;
      }

      const page = root.firstElementChild;
      if (!page) return;
      const container =
        page.children.length === 1 ? page.firstElementChild : page;
      if (!container) return;
      const targets = container.children.length
        ? Array.from(container.children)
        : [container];

      timeline
        .fromTo(
          container,
          { autoAlpha: 0, scale: 0.995 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.38,
            clearProps: "opacity,visibility,transform",
          },
        )
        .fromTo(
          targets,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.06,
            clearProps: "opacity,visibility,transform",
          },
          "-=0.2",
        );
    });

    return () => media.revert();
  }, [isWorkerRoute, pathname]);

  if (isWorkerRoute) return children;

  return (
    <div key={pathname} ref={rootRef} className="flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
