const assetPath = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const stills = [
  { src: '/ai/cover.webp', title: '归园田居·其三｜主视觉' },
  { src: '/ai/process-1.webp', title: '归园田居·其三｜场景探索' },
  { src: '/ai/process-2.webp', title: '归园田居·其三｜角色与光影' },
];

export default function AIShowcase() {
  const videoSrc = assetPath('/ai/gui-yuan-tian-ju.mp4');
  return (
    <section id="ai-works" className="ai-showcase section wrap">
      <div className="section-marker">
        <span>02.2 / AI VISUAL WORKS</span>
        <span>生成影像实验</span>
      </div>

      <div className="ai-heading">
        <p>AI VISUAL WORKS</p>
        <h2>归园田居<span>·其三</span></h2>
        <p>陶渊明的诗 · AI 诗意视觉生成</p>
      </div>

      <div className="ai-layout">
        <a className="ai-card ai-card-feature" href={assetPath(stills[0].src)} target="_blank" rel="noreferrer" aria-label={`查看作品：${stills[0].title}`}>
          <img src={assetPath(stills[0].src)} alt={stills[0].title} loading="lazy" decoding="async" />
          <span className="ai-badge">AI 生成</span>
          <span className="ai-arrow" aria-hidden="true">↗</span>
          <span className="ai-card-label">01 / 主视觉</span>
        </a>

        <div className="ai-side">
          <article className="ai-card ai-video-card">
            <video controls playsInline preload="metadata" poster={assetPath('/ai/video-poster.webp')} aria-label="《归园田居·其三》AI 视频创作" onPlay={event => {
              document.querySelectorAll('video').forEach(player => {
                if (player !== event.currentTarget) player.pause();
              });
            }}>
              <source src={videoSrc} type="video/mp4" />
              你的浏览器暂不支持视频播放，<a href={videoSrc}>下载视频</a>。
            </video>
            <span className="ai-badge">AI 视频</span>
            <span className="ai-card-label">02 / 《归园田居·其三》</span>
          </article>

          <div className="ai-process-grid">
            {stills.slice(1).map((still, index) => (
              <a className="ai-card ai-process-card" href={assetPath(still.src)} target="_blank" rel="noreferrer" aria-label={`查看作品：${still.title}`} key={still.src}>
                <img src={assetPath(still.src)} alt={still.title} loading="lazy" decoding="async" />
                <span className="ai-arrow" aria-hidden="true">↗</span>
                <span className="ai-card-label">{String(index + 3).padStart(2, '0')} / 过程图</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
