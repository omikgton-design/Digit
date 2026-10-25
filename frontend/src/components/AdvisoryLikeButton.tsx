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

// Like = эрхий хуруу (зүрх нь "хадгалах" үйлдэлд зориулагдсан тул ялгана).
export function ThumbIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 10.5v9.5H4.2a1.2 1.2 0 0 1-1.2-1.2v-7.1a1.2 1.2 0 0 1 1.2-1.2H7Zm0 0 4-7.2a1.9 1.9 0 0 1 3.5 1.3l-.7 4.4h5.1a2 2 0 0 1 2 2.4l-1.3 7.2a2.2 2.2 0 0 1-2.2 1.8H7"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
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
        aria-label={liked ? "Like-ыг буцаах" : "Like дарах"}
        title={`Лайк: ${count}`}
        disabled={submitting}
      >
        <ThumbIcon filled={liked} />
      </button>
      {showCount ? <span className="advisory-like-count-text">{count}</span> : null}
    </div>
  );
}
