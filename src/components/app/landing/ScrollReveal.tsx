"use client";

/**
 * ScrollReveal — mounts an IntersectionObserver that adds .is-visible
 * to every .scroll-reveal element on the page as it enters the viewport.
 *
 * Renders nothing — purely a side-effect component.
 * Place it once inside the landing page layout (or at the top of the page).
 *
 * Why a client component instead of CSS animation-timeline?
 * animation-timeline: view() + animation-range has partial/broken support
 * in several browser versions — elements get stuck at opacity:0.
 * IntersectionObserver works everywhere, including older Chrome/Safari.
 */

import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Once visible, stop watching — no need to hide on scroll-out
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Start revealing when 12% of the element is visible
        threshold: 0.12,
        // Slight negative top margin so reveal starts just before element
        // fully enters the viewport — feels more natural
        rootMargin: "0px 0px -40px 0px",
      }
    );

    // Observe all current .scroll-reveal elements
    const targets = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
