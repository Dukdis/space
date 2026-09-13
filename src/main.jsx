import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import content from './content.json';
import PaintingGallery from './PaintingGallery.jsx';
import AwardsGallery from './AwardsGallery.jsx';
import AIShowcase from './AIShowcase.jsx';
import AdminApp from './AdminApp.jsx';
import WarpText from './WarpText.jsx';
import CursorGrid from './CursorGrid.jsx';
import DotField from './DotField.jsx';

const assetPath = path => import.meta.env.BASE_URL + String(path || '').replace(/^\//, '');
const pad = number => String(number + 1).padStart(2, '0');

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function App({ siteContent }) {
  const { hero, about, works, videos, ai, paintings, awards, contact } = siteContent;
  const [menu, setMenu] = useState(false);
  const [activeHero, setActiveHero] = useState(null);
  const [galleryPaused, setGalleryPaused] = useState(false);

  return <>
    <a className="skip" href="#main">跳至主要内容</a>
    <header className="header wrap">
      <a className="brand" href="#home" aria-label={siteContent.settings.siteName + ' 首页'}>SHUI</a>
      <div className="header-actions">
        <a className="contact-pill" href="#contact"><span aria-hidden="true">✉</span> 联系我</a>
        <button className="menu-button" aria-label={menu ? '关闭导航' : '打开导航'} aria-expanded={menu} aria-controls="navigation" onClick={() => setMenu(!menu)}><span /><span /></button>
      </div>
      <nav id="navigation" className={menu ? 'open' : ''} aria-label="主导航">
        {[['about', '个人介绍'], ['works', '作品案例'], ['awards', '获奖证书'], ['contact', '联系方式']].map(([id, label]) => <a key={id} href={'#' + id} onClick={() => setMenu(false)}>{label}<Arrow /></a>)}
      </nav>
    </header>

    <main id="main">
      <section className="hero wrap" id="home">
        <div className="hero-glow" aria-hidden="true" />
        <DotField className="hero-dot-field" dotRadius={1.6} dotSpacing={18} cursorRadius={380} bulgeStrength={42} glowRadius={220} gradientFrom="rgba(255, 234, 208, .28)" gradientTo="rgba(244, 154, 82, .16)" glowColor="rgba(255, 176, 105, .13)" />
        <CursorGrid className="hero-cursor-grid" cellSize={76} color="#f6b16f" radius={145} holdTime={220} fadeDuration={980} lineWidth={1} maxOpacity={.65} fillOpacity={.025} gridOpacity={.018} cellRadius={12} clickPulse pulseSpeed={660} />
        <div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" />
        <div className="hero-side" aria-hidden="true"><span>01</span><i /><span>SCROLL TO EXPLORE</span><span>↓</span></div>
        <div className="hero-copy">
          <p className="eyebrow"><span>✧</span> {hero.eyebrow}</p>
          <h1>{hero.titleLine1}<br />{hero.titleLine2}<span>{hero.titleHighlight}</span></h1>
          <p className="hero-description">{hero.description.map((line, index) => <React.Fragment key={line + index}>{line}{index < hero.description.length - 1 && <br />}</React.Fragment>)}</p>
        </div>
        <div className="hero-name warp-name"><WarpText className="hero-warp-title" text={hero.displayName} color="#fff8f1" warpStrength={.07} warpScale={1.65} speed={.42} pointerInfluence={.32} pointerStrength={.34} refraction={.022} ripple fontSize="clamp(4rem, 6.7vw, 7.2rem)" fontWeight={700} fontFamily="Arial, sans-serif" letterSpacing="-.065em" lineHeight={.82} /></div>
        <img className="hero-avatar" src={assetPath(hero.avatar)} alt={hero.avatarAlt} fetchPriority="high" />
        <div className="hero-edition"><strong>{hero.year}</strong><span>Digital<br />Media<br />Art</span><i /></div>
        <nav className="hero-links" aria-label="首页快捷导航">
          {[['about', '个人介绍', 'ABOUT ME'], ['works', '作品案例', 'MY WORKS'], ['awards', '获奖证书', 'RECOGNITION'], ['contact', '联系方式', 'CONTACT']].map(([id, cn, en]) => <a key={id} href={'#' + id} className={activeHero === id ? 'is-selected' : undefined} aria-current={activeHero === id ? 'location' : undefined} onClick={() => setActiveHero(id)}><span>{cn}</span><small>{en}</small><b aria-hidden="true">↗</b></a>)}
        </nav>
        <div className="hero-bottom"><span>DIGITAL MEDIA ART</span><span>CREATIVE TECHNOLOGY</span></div>
      </section>

      <div className="discipline-strip"><div className="wrap"><span>DIGITAL MEDIA ART</span><span>✳</span><span>VISUAL EXPLORATION</span><span>✳</span><span>CREATIVE EXPERIMENTS</span><span>✳</span></div></div>

      <section id="about" className="about section wrap">
        <div className="section-marker"><span>01 / ABOUT ME</span><span>一点关于我</span></div>
        <div className="profile-layout">
          <aside className="profile-photo"><img src={assetPath(about.portrait)} alt={about.portraitAlt} loading="lazy" /><div><span>{about.photoLabel}</span><small>{about.photoCaption}</small></div></aside>
          <div className="profile-content">
            <div className="profile-heading"><h2>{about.name}</h2><p>{about.role}</p></div>
            <div className="profile-cards">
              <section className="profile-card"><h3>基本信息</h3><dl className="profile-facts">{about.facts.map((fact, index) => <div key={fact.label + index}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></section>
              <section className="profile-card"><h3>教育经历</h3><ul className="education-list">{about.education.map((item, index) => <li key={item.period + index}><time>{item.period}</time><span>{item.detail}</span></li>)}</ul></section>
              <section className="profile-card"><h3>职业技能</h3>{about.skills.map((skill, index) => <p key={skill + index}>{skill}</p>)}</section>
              <section className="profile-card"><h3>代表荣誉</h3><ul className="honors-list">{about.honors.map((honor, index) => <li key={honor + index}>{honor}</li>)}</ul></section>
            </div>
          </div>
        </div>
      </section>

      <section id="works" className="works section wrap">
        <div className="section-marker"><span>02 / SELECTED WORKS</span><span>想法发生的地方</span></div>
        <div className="gallery-heading">
          <p className="eyebrow">IMAGINATION IN MOTION</p>
          <h2>{works.titleLine1}<br />{works.titleLine2}<span>{works.titleHighlight}</span></h2>
          <p>{works.description}</p>
          <div className="gallery-toolbar"><span>作品选集 / {String(works.items.length).padStart(2, '0')}</span><button type="button" onClick={() => setGalleryPaused(!galleryPaused)} aria-pressed={galleryPaused}>{galleryPaused ? '继续滚动 ▶' : '暂停滚动 Ⅱ'}</button></div>
        </div>
        <div className={'gallery-window' + (galleryPaused ? ' is-paused' : '')} role="region" aria-label="从右向左滚动的作品选集，悬停或聚焦可暂停" tabIndex="0">
          <div className="gallery-track">{[0, 1].map(copy => <div className="gallery-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>{works.items.map((project, index) => <article className="gallery-card" key={project.src + copy}><a href={assetPath(project.src)} target="_blank" rel="noreferrer" tabIndex={copy === 1 ? -1 : 0} aria-label={'查看完整作品：' + project.title}><div className="gallery-image"><img src={assetPath(project.src)} alt={copy === 1 ? '' : project.title} loading="lazy" decoding="async" /><span aria-hidden="true">↗</span></div><div className="gallery-caption"><span>{pad(index)} /</span><h3>{project.title}</h3></div></a></article>)}</div>)}</div>
        </div>
        <p className="gallery-hint">悬停暂停 · 点击图片查看完整作品 · 手机端可左右滑动</p>
      </section>

      <section id="video-works" className="video-works section wrap">
        <div className="section-marker"><span>02.1 / MOTION &amp; FILM</span><span>影像里的表达</span></div>
        <div className="section-heading"><h2>{videos.title}<sup> / {String(videos.items.length).padStart(2, '0')}</sup></h2><p>{videos.description}</p></div>
        <div className="video-grid">{videos.items.map((video, index) => <article className="video-card" key={video.src}><video controls playsInline preload="metadata" poster={assetPath(video.poster)} aria-label={video.title} onPlay={event => { document.querySelectorAll('video').forEach(player => { if (player !== event.currentTarget) player.pause(); }); }}><source src={assetPath(video.src)} type="video/mp4" />你的浏览器暂不支持视频播放，<a href={assetPath(video.src)}>下载视频</a>。</video><div className="video-caption"><span>{pad(index)} / FILM</span><h3>{video.title}</h3></div></article>)}</div>
      </section>

      <AIShowcase content={ai} />
      <PaintingGallery content={paintings} />
      <AwardsGallery content={awards} />

      <section id="contact" className="contact">
        <div className="wrap">
          <div className="section-marker"><span>04 / GET IN TOUCH</span><span><i className="status-dot" /> 期待新的连接</span></div>
          <div className="contact-heading"><h2>下一次灵感，<br />从一句 <em>Hello.</em> 开始<span className="contact-star">✳</span></h2><p>{contact.description.map((line, index) => <React.Fragment key={line + index}>{line}{index < contact.description.length - 1 && <br />}</React.Fragment>)}</p></div>
          <div className="contact-links"><div><span>EMAIL / 邮箱</span><p><a href={'mailto:' + contact.email}>{contact.email} <span aria-hidden="true">↗</span></a></p></div><div><span>PHONE / 电话</span><p><a href={'tel:' + contact.phone}>{contact.phone} <span aria-hidden="true">↗</span></a></p></div></div>
          <footer><a className="brand" href="#home">{siteContent.settings.siteName}<span>*</span></a><span>© {new Date().getFullYear()} {contact.footer}</span><a href="#home">回到顶部 ↑</a></footer>
        </div>
      </section>
    </main>
  </>;
}

function RootRouter() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash.startsWith('#/admin'));
  useEffect(() => {
    const handleHash = () => setIsAdmin(window.location.hash.startsWith('#/admin'));
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  return isAdmin ? <AdminApp initialContent={content} /> : <App siteContent={content} />;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><RootRouter /></React.StrictMode>);
