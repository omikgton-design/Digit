import { useEffect, useState } from "react";
import type { RatingResponse } from "../types";

type Props = {
  average: number;
  count: number;
  userRating?: number | null;
  onRate?: (score: number) => Promise<RatingResponse>;
  compact?: boolean;
};

export function RatingControl({ average, count, userRating = null, onRate, compact = false }: Props) {
  const [ratingAverage, setRatingAverage] = useState(average || 0);
  const [ratingCount, setRatingCount] = useState(count || 0);
  const [selectedRating, setSelectedRating] = useState<number | null>(userRating || null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setRatingAverage(average || 0);
    setRatingCount(count || 0);
    setSelectedRating(userRating || null);
  }, [average, count, userRating]);

  const submitRating = async (score: number) => {
    if (!onRate || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const next = await onRate(score);
      setRatingAverage(next.rating_average);
      setRatingCount(next.rating_count);
      setSelectedRating(next.user_rating);
      setMessage("Үнэлгээ хадгалагдлаа.");
    } catch (err) {
      setMessage((err as Error).message || "Үнэлгээ өгөхөд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeScore = hoverRating || selectedRating || 0;

  return (
    <div className={`rating-control ${compact ? "rating-control-compact" : ""}`}>
      <div className="rating-summary">
        <span className="rating-score">★ {ratingAverage.toFixed(1)}</span>
        <span className="rating-count">({ratingCount} reviews)</span>
      </div>
      {onRate ? (
        <div className="rating-stars" aria-label="1-5 оноогоор үнэлэх">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              className={score <= activeScore ? "is-active" : ""}
              onClick={() => submitRating(score)}
              onMouseEnter={() => setHoverRating(score)}
              onMouseLeave={() => setHoverRating(null)}
              disabled={submitting}
              aria-label={`${score} оноо өгөх`}
            >
              ★
            </button>
          ))}
        </div>
      ) : null}
      {message && !compact ? <div className="rating-message">{message}</div> : null}
    </div>
  );
}
