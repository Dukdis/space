const assetPath = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export default function PaintingGallery({ content }) {
  const paintings = content.items;
  return (
    <section id="painting-works" className="painting-works section wrap">
      <div className="section-marker">
        <span>02.3 / DRAWING &amp; PAINTING</span>
        <span>纸面上的观察</span>
      </div>

      <div className="painting-heading">
        <h2>{content.titleLine1}<br />{content.titleLine2}<span>{content.titleHighlight}</span></h2>
        <p>{content.description}</p>
      </div>

      <div className="painting-filter" aria-label="绘画作品信息">
        <span>作品类型</span>
        <strong>全部作品</strong>
        <span className="painting-count">{paintings.length} 件作品</span>
      </div>

      <div className="painting-grid">
        {paintings.map((painting, index) => (
          <article className="painting-card" key={painting.src + index}>
            <a href={assetPath(painting.src)} target="_blank" rel="noreferrer" aria-label={`查看作品：${painting.title}`}>
              <div className="painting-image">
                <img src={assetPath(painting.src)} alt={painting.title} loading="lazy" decoding="async" />
                <span className="painting-arrow" aria-hidden="true">↗</span>
                <span className="painting-tag">{painting.tag}</span>
              </div>
              <div className="painting-caption">
                <h3>{painting.title}</h3>
                <span>{String(index + 1).padStart(2, '0')} / {String(paintings.length).padStart(2, '0')}</span>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
