export default function LoadingSkeleton() {
  return (
    <div className="feed" aria-label="समाचार लोड हुँदैछ">
      <div className="feed__header">
        <div className="skeleton-line skeleton-line--title" />
      </div>

      <div className="feed__list">
        {[1, 2, 3].map((index) => (
          <article key={index} className="story skeleton">
            <div className="skeleton-box skeleton-box--media" />
            <div className="story__body">
              <div className="skeleton-line skeleton-line--meta" />
              <div className="skeleton-line skeleton-line--h" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-line--short" />
              <div className="story__actions">
                <div className="skeleton-pill" />
                <div className="skeleton-pill" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
