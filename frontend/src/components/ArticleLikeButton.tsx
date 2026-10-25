import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { toggleArticleLike } from "../api/website";
import { useToast } from "./ToastProvider";
import { ThumbIcon } from "./AdvisoryLikeButton";

type Props = {
  articleId: number;
  initialLiked?: boolean;
  initialCount?: number;
  showCount?: boolean;
  className?: string;
};

export function ArticleLikeButton({ articleId, initialLiked = false, initialCount = 0, showCount = true, className = "" }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  useEffect(() => setLiked(initialLiked), [initialLiked]);
  useEffect(() => setCount(initialCount), [initialCount]);

  const toggle = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const next = await toggleArticleLike(articleId);
      setLiked(next.liked);
      setCount(next.like_count);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setBusy(false);
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
        title={`Like: ${count}`}
        disabled={busy}
      >
        <ThumbIcon filled={liked} />
      </button>
      {showCount ? <span className="advisory-like-count-text">{count}</span> : null}
    </div>
  );
}
