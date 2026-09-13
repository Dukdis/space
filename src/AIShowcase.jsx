const assetPath = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
export default function AIShowcase({ content }) {
  const stills = content.images;
  const feature = stills[0];
  const videoSrc = assetPath(content.video.src);
  return (
    <section id="ai-works" className="ai-showcase section wrap">
      <div className="section-marker">
        <span>02.2 / AI VISUAL WORKS</span>
        <span>生成影像实验</span>
      </div>

      <div className="ai-heading">
        <p>AI VISUAL WORKS</p>
        <h2>{content.title}<span>{content.titleAccent}</span></h2>
        <p>{content.description}</p>
      </div>

      <div className="ai-layout">
        {feature ? <a className="ai-card ai-card-feature" href={assetPath(feature.src)} target="_blank" rel="noreferrer" aria-label={`查看作品：${feature.title}`}>
          <img src={assetPath(feature.src)} alt={feature.title} loading="lazy" decoding="async" />
          <span className="ai-badge">AI 生成</span>
          <span className="ai-arrow" aria-hidden="true">↗</span>
          <span className="ai-card-label">{feature.label}</span>
        </a> : <div className="ai-card ai-card-feature" aria-label="暂无 AI 主视觉" />}

        <div className="ai-side">
          <article className="ai-card ai-video-card">
            <video controls playsInline preload="metadata" poster={assetPath(content.video.poster)} aria-label={content.video.title} onPlay={event => {
              document.querySelectorAll('video').forEach(player => {
                if (player !== event.currentTarget) player.pause();
              });
            }}>
              <source src={videoSrc} type="video/mp4" />
              你的浏览器暂不支持视频播放，<a href={videoSrc}>下载视频</a>。
            </video>
            <span className="ai-badge">AI 视频</span>
            <span className="ai-card-label">{content.video.label}</span>
          </article>

          <div className="ai-process-grid">
            {stills.slice(1).map((still, index) => (
              <a className="ai-card ai-process-card" href={assetPath(still.src)} target="_blank" rel="noreferrer" aria-label={`查看作品：${still.title}`} key={still.src}>
                <img src={assetPath(still.src)} alt={still.title} loading="lazy" decoding="async" />
                <span className="ai-arrow" aria-hidden="true">↗</span>
                <span className="ai-card-label">{still.label || `${String(index + 3).padStart(2, '0')} / 过程图`}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
