export default function LoadingSkeleton() {
  return (
    <div className="news-feed">
      <div className="container">
        {[1, 2, 3].map((index) => (
          <article key={index} className="news-post skeleton">
            <div className="skeleton-image"></div>
            <div className="post-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
              <div className="post-actions">
                <div className="skeleton-button"></div>
                <div className="skeleton-meta"></div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}