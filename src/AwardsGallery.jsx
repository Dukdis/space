const assetPath = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export default function AwardsGallery({ content }) {
  const certificates = content.items;
  return (
    <section id="awards" className="awards-showcase section">
      <div className="wrap">
        <div className="section-marker">
          <span>03 / RECOGNITION</span>
          <span>成长的注脚</span>
        </div>

        <div className="awards-heading">
          <p>RECOGNITION ARCHIVE</p>
          <h2>{content.titleLine1}<br />{content.titleLine2}<span>{content.titleHighlight}</span></h2>
          <p>{content.description}</p>
        </div>

        <div className="certificate-stage" aria-label={`${certificates.length}份获奖证书`}>
          {certificates.map((certificate, index) => (
            <article className={`award-card award-card-${index + 1}`} key={certificate.src + index}>
              <a href={assetPath(certificate.src)} target="_blank" rel="noreferrer" aria-label={`查看证书：${certificate.title}`}>
                <div className="award-image">
                  <img src={assetPath(certificate.src)} alt={`${certificate.title}，${certificate.award}`} loading="lazy" decoding="async" />
                  <span aria-hidden="true">↗</span>
                </div>
                <div className="award-caption">
                  <small>{String(index + 1).padStart(2, '0')} / CERTIFICATE</small>
                  <h3>{certificate.title}</h3>
                  <p>{certificate.award}</p>
                </div>
              </a>
            </article>
          ))}
        </div>
        <p className="awards-hint">点击证书查看完整图片</p>
      </div>
    </section>
  );
}
