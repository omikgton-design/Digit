import { useEffect, useState } from "react";
import { toggleAdvisoryLike } from "../api/website";
import { useToast } from "./ToastProvider";

type Props = {
  advisoryId: number;
  className?: string;
  initialLiked?: boolean;
  initialCount?: number;
  showCount?: boolean;
  onToggle?: (state: { liked: boolean; like_count: number }) => void;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.5 4.9 13.8a4.8 4.8 0 0 1 6.8-6.8L12 7.3l.3-.3a4.8 4.8 0 0 1 6.8 6.8L12 20.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdvisoryLikeButton({
  advisoryId,
  className = "",
  initialLiked = false,
  initialCount = 0,
  showCount = false,
  onToggle,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const toggle = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const next = await toggleAdvisoryLike(advisoryId);
      setLiked(next.liked);
      setCount(next.like_count);
      onToggle?.(next);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`advisory-like-wrap ${className}`.trim()}>
      <button
        type="button"
        className={`advisory-like-button ${liked ? "is-liked" : ""}`}
        onClick={toggle}
        aria-pressed={liked}
        aria-label={liked ? "Таалагдсанаас хасах" : "Таалагдсан болгох"}
        title={`Лайк: ${count}`}
        disabled={submitting}
      >
        <HeartIcon filled={liked} />
      </button>
      {showCount ? <span className="advisory-like-count-text">{count}</span> : null}
    </div>
  );
}
