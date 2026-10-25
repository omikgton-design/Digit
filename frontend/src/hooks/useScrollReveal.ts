import { useEffect } from "react";

/**
 * Adds a staggered "fade up + un-blur" reveal animation to any element
 * carrying the `.reveal` class, the moment it scrolls into view.
 * Re-runs whenever `dep` changes so it also covers content that loads
 * asynchronously (e.g. after data arrives).
 */
export function useScrollReveal(dep: unknown) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [dep]);
}