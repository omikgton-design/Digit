import type { ReviewItem } from "../types";

type Props = {
  reviews: ReviewItem[];
  loading: boolean;
};

function formatReviewDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return value;
  }
}

export function ReviewList({ reviews, loading }: Props) {
  if (loading) {
    return <div className="review-list-empty">Сэтгэгдлүүд ачаалж байна...</div>;
  }

  if (!reviews.length) {
    return <div className="review-list-empty">Одоогоор сэтгэгдэл бичигдээгүй байна. Эхнийх нь та байгаарай!</div>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div className={`review-item ${review.is_own ? "review-item-own" : ""}`} key={review.id}>
          <div className="review-item-header">
            <div className="review-item-avatar" aria-hidden="true">
              {review.author_name.trim().charAt(0).toUpperCase() || "?"}
            </div>
            <div className="review-item-meta">
              <span className="review-item-author">
                {review.author_name}
                {review.is_own ? <span className="review-item-own-badge">Таны сэтгэгдэл</span> : null}
              </span>
              <span className="review-item-date">{formatReviewDate(review.update_date || review.created_date)}</span>
            </div>
            <div className="review-item-score" aria-label={`${review.score} од`}>
              {"★".repeat(review.score)}
              <span className="review-item-score-empty">{"★".repeat(5 - review.score)}</span>
            </div>
          </div>
          <p className="review-item-comment">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
