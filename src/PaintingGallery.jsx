const paintings = [
  { title: '动漫手稿', src: '/paintings/art-1-corrected.jpg', tag: 'CHARACTER' },
  { title: '马克笔彩绘', src: '/paintings/art-2.jpg', tag: 'MARKER' },
  { title: '素描', src: '/paintings/art-3.jpg', tag: 'SKETCH' },
  { title: '素描绘画', src: '/paintings/art-4.jpg', tag: 'DRAWING' },
  { title: '素描人物', src: '/paintings/art-5.jpg', tag: 'PORTRAIT' },
  { title: '速写模型', src: '/paintings/art-6.jpg', tag: 'STUDY' },
  { title: '速写人物', src: '/paintings/art-7.jpg', tag: 'FIGURE' },
  { title: '写实绘画', src: '/paintings/art-8.jpg', tag: 'REALISM' },
];

const assetPath = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export default function PaintingGallery() {
  return (
    <section id="painting-works" className="painting-works section wrap">
      <div className="section-marker">
        <span>02.3 / DRAWING &amp; PAINTING</span>
        <span>纸面上的观察</span>
      </div>

      <div className="painting-heading">
        <h2>安静地观察，<br />让笔触留下<span>温度。</span></h2>
        <p>人物速写、动漫、素描及写实绘画。</p>
      </div>

      <div className="painting-filter" aria-label="绘画作品信息">
        <span>作品类型</span>
        <strong>全部作品</strong>
        <span className="painting-count">8 件作品</span>
      </div>

      <div className="painting-grid">
        {paintings.map((painting, index) => (
          <article className="painting-card" key={painting.src}>
            <a href={assetPath(painting.src)} target="_blank" rel="noreferrer" aria-label={`查看作品：${painting.title}`}>
              <div className="painting-image">
                <img src={assetPath(painting.src)} alt={painting.title} loading="lazy" decoding="async" />
                <span className="painting-arrow" aria-hidden="true">↗</span>
                <span className="painting-tag">{painting.tag}</span>
              </div>
              <div className="painting-caption">
                <h3>{painting.title}</h3>
                <span>{String(index + 1).padStart(2, '0')} / 08</span>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
