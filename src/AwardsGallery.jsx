const certificates = [
  { title: '夜雾鎏金——夜灯加湿器', award: '东方设计奖国家一等奖', src: '/certificates/certificate-1.jpg?v=2' },
  { title: '“公路车的3D美学：从设计到动画”', award: '东方设计奖国家三等奖', src: '/certificates/certificate-2.jpg?v=2' },
  { title: '敦煌壁画古乐器形态蓝牙音响设计', award: '东方设计奖国家三等奖', src: '/certificates/certificate-3.jpg?v=2' },
  { title: '虚拟现实技术与莫高窟壁画沉浸式体验研究', award: '未来设计师省级三等奖', src: '/certificates/certificate-4.jpg?v=2' },
  { title: '陇上麦浪——原生态桌椅', award: '未来设计师省级三等奖', src: '/certificates/certificate-5.jpg?v=2' },
  { title: '2019年三等奖学金', award: '兰州交通大学', src: '/certificates/certificate-6.jpg?v=2' },
];

const assetPath = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export default function AwardsGallery() {
  return (
    <section id="awards" className="awards-showcase section">
      <div className="wrap">
        <div className="section-marker">
          <span>03 / RECOGNITION</span>
          <span>成长的注脚</span>
        </div>

        <div className="awards-heading">
          <p>RECOGNITION ARCHIVE</p>
          <h2>成长路上拾到的<br />珍贵<span>贝壳。</span></h2>
          <p>比赛类获奖证书及奖学金证书，此外还有研究生奖学金、校级摄影作品一等奖、优秀志愿者证书等等。</p>
        </div>

        <div className="certificate-stage" aria-label="六份获奖证书">
          {certificates.map((certificate, index) => (
            <article className={`award-card award-card-${index + 1}`} key={certificate.src}>
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
