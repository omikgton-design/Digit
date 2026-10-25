import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
};

const defaultFormatter = (value: number) => new Intl.NumberFormat("mn-MN").format(value);

export function CountUpNumber({ value, duration = 1400, formatter = defaultFormatter, className }: Props) {
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(() =>
    typeof window === "undefined" || !("IntersectionObserver" in window) ? value : 0
  );

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window) || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame: number;
    const animate = () => {
      const start = performance.now();
      const from = 0;
      const to = value;
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(from + (to - from) * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(step);
        }
      };
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span className={className} ref={elementRef}>
      {formatter(display)}
    </span>
  );
}