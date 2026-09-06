import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import media from './works.json';
import PaintingGallery from './PaintingGallery.jsx';
import AwardsGallery from './AwardsGallery.jsx';
import AIShowcase from './AIShowcase.jsx';
import WarpText from './WarpText.jsx';
import CursorGrid from './CursorGrid.jsx';
import DotField from './DotField.jsx';

const assetPath = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
const projects = media.filter(item => item.kind === 'image').map(item => ({ ...item, src: assetPath(item.src) }));
const videos = media.filter(item => item.kind === 'video').map(item => ({ ...item, src: assetPath(item.src) }));
function Arrow({diagonal=false}) { return <span aria-hidden="true">{diagonal ? '↗' : '↗'}</span> }
function App(){
 const [menu,setMenu]=useState(false);
 const [activeHero,setActiveHero]=useState(null);
 const [galleryPaused,setGalleryPaused]=useState(false);
 return <>
 <a className="skip" href="#main">跳至主要内容</a>
 <header className="header wrap"><a className="brand" href="#home" aria-label="ShuiShui's space 首页">SHUI</a><div className="header-actions"><a className="contact-pill" href="#contact"><span aria-hidden="true">✉</span> 联系我</a><button className="menu-button" aria-label={menu?'关闭导航':'打开导航'} aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}><span/ ><span/ ></button></div><nav id="navigation" className={menu?'open':''} aria-label="主导航">{[['about','个人介绍'],['works','作品案例'],['awards','获奖证书'],['contact','联系方式']].map(([id,label])=><a key={id} href={'#'+id} onClick={()=>setMenu(false)}>{label}<Arrow/></a>)}</nav></header>
 <main id="main">
 <section className="hero wrap" id="home">
 <div className="hero-glow" aria-hidden="true"/>
 <DotField className="hero-dot-field" dotRadius={1.6} dotSpacing={18} cursorRadius={380} bulgeStrength={42} glowRadius={220} gradientFrom="rgba(255, 234, 208, .28)" gradientTo="rgba(244, 154, 82, .16)" glowColor="rgba(255, 176, 105, .13)"/>
 <CursorGrid className="hero-cursor-grid" cellSize={76} color="#f6b16f" radius={145} holdTime={220} fadeDuration={980} lineWidth={1} maxOpacity={.65} fillOpacity={.025} gridOpacity={.018} cellRadius={12} clickPulse pulseSpeed={660}/>
 <div className="orbit orbit-one" aria-hidden="true"/><div className="orbit orbit-two" aria-hidden="true"/>
 <div className="hero-side" aria-hidden="true"><span>01</span><i/><span>SCROLL TO EXPLORE</span><span>↓</span></div>
 <div className="hero-copy"><p className="eyebrow"><span>✧</span> DIGITAL MEDIA ART STUDENT</p><h1>用数字媒体艺术<br/>探索<span>无限可能</span></h1><p className="hero-description">探索视觉设计、交互体验、影像创作与 AI 艺术实验<br/>用创意连接想象与现实<br/>创造有温度的数字体验</p></div>
 <div className="hero-name warp-name"><WarpText className="hero-warp-title" text={"ShuiShui's\nSpace·Welcome"} color="#fff8f1" warpStrength={.07} warpScale={1.65} speed={.42} pointerInfluence={.32} pointerStrength={.34} refraction={.022} ripple fontSize="clamp(4rem, 6.7vw, 7.2rem)" fontWeight={700} fontFamily="Arial, sans-serif" letterSpacing="-.065em" lineHeight={.82}/></div>
 <img className="hero-avatar" src={assetPath('/avatar-transparent.png')} alt="ShuiShui 的动漫形象，戴黑框眼镜，穿蓝色卫衣" fetchPriority="high" width="938" height="1099"/>
 <div className="hero-edition"><strong>2026</strong><span>Digital<br/>Media<br/>Art</span><i/></div>
 <nav className="hero-links" aria-label="首页快捷导航">{[['about','个人介绍','ABOUT ME'],['works','作品案例','MY WORKS'],['awards','获奖证书','RECOGNITION'],['contact','联系方式','CONTACT']].map(([id,cn,en])=><a key={id} href={'#'+id} className={activeHero===id?'is-selected':undefined} aria-current={activeHero===id?'location':undefined} onClick={()=>setActiveHero(id)}><span>{cn}</span><small>{en}</small><b aria-hidden="true">↗</b></a>)}</nav>
 <div className="hero-bottom"><span>DIGITAL MEDIA ART</span><span>CREATIVE TECHNOLOGY</span></div>
 </section>
 <div className="discipline-strip"><div className="wrap"><span>DIGITAL MEDIA ART</span><span>✳</span><span>VISUAL EXPLORATION</span><span>✳</span><span>CREATIVE EXPERIMENTS</span><span>✳</span></div></div>
 <section id="about" className="about section wrap"><div className="section-marker"><span>01 / ABOUT ME</span><span>一点关于我</span></div>
 <div className="profile-layout">
 <aside className="profile-photo"><img src={assetPath('/portrait.jpg')} alt="澹淼的证件照" loading="lazy" width="1500" height="2100"/><div><span>SHUISHUI</span><small>数字媒体艺术 · 在读学生</small></div></aside>
 <div className="profile-content"><div className="profile-heading"><h2>澹淼</h2><p>数字媒体艺术创作者 · Digital Media Artist</p></div>
 <div className="profile-cards">
 <section className="profile-card"><h3>基本信息</h3><dl className="profile-facts"><div><dt>民族</dt><dd>汉族</dd></div><div><dt>政治面貌</dt><dd>中共党员</dd></div><div><dt>出生年月</dt><dd>1997年3月</dd></div><div><dt>籍贯</dt><dd>河南省商丘市</dd></div></dl></section>
 <section className="profile-card"><h3>教育经历</h3><ul className="education-list"><li><time>2024.09—2027.06</time><span>兰州交通大学 · 元宇宙数字媒体艺术（研究生）</span></li><li><time>2018.09—2022.06</time><span>兰州交通大学 · 动画（本科）</span></li><li><time>2019.09—2022.06</time><span>兰州交通大学 · 会计（辅修双学位）</span></li></ul></section>
 <section className="profile-card"><h3>职业技能</h3><p>Maya / Cinema 4D / Unity 3D / Photoshop / Premiere Pro</p><p>摄影、摄像、剪辑、无人机、AI 视觉生成。</p><p>擅长使用 ComfyUI、Stable Diffusion 等主流 AI 工具。</p></section>
 <section className="profile-card"><h3>代表荣誉</h3><ul className="honors-list"><li>2018—2019 · 兰州交通大学三等奖学金</li><li>2019—2020 · 甘肃省美术比赛入围证书</li><li>2019—2020 · 兰州交通大学团体比赛二等奖</li><li>2025 · 兰州交通大学研究生三等奖学金</li><li>2025 · 东方设计奖《夜雾鎏金—夜灯加湿器》全国决赛国赛一等奖</li><li>2025 · 东方设计奖《敦煌壁画古乐器形态蓝牙音响设计》全国决赛国赛二等奖</li><li>2026 · 东方设计奖《公路车的3D美学：从设计到动画》全国决赛国赛三等奖</li><li>第十三届未来设计师 ·《虚拟现实技术与莫高窟壁画沉浸式体验研究》省级三等奖</li><li>第十三届未来设计师 ·《陇上麦浪——原生态桌椅》省级二等奖</li></ul></section>
 </div></div></div></section>
 <section id="works" className="works section wrap"><div className="section-marker"><span>02 / SELECTED WORKS</span><span>想法发生的地方</span></div>
 <div className="gallery-heading"><p className="eyebrow">IMAGINATION IN MOTION</p><h2>让想象成形，<br/>让作品<span>走进视野。</span></h2><p>从数字场景到产品设计，记录每一次创作的探索。</p><div className="gallery-toolbar"><span>作品选集 / 07</span><button type="button" onClick={()=>setGalleryPaused(!galleryPaused)} aria-pressed={galleryPaused}>{galleryPaused?'继续滚动 ▶':'暂停滚动 Ⅱ'}</button></div></div>
 <div className={'gallery-window'+(galleryPaused?' is-paused':'')} role="region" aria-label="从右向左滚动的作品选集，悬停或聚焦可暂停" tabIndex="0"><div className="gallery-track">{[0,1].map(copy=><div className="gallery-group" key={copy} aria-hidden={copy===1?true:undefined}>{projects.map((p,index)=><article className="gallery-card" key={p.src}><a href={p.src} target="_blank" rel="noreferrer" tabIndex={copy===1?-1:0} aria-label={'查看完整作品：'+p.title}><div className="gallery-image"><img src={p.src} alt={copy===1?'':p.title} loading="lazy" decoding="async"/><span aria-hidden="true">↗</span></div><div className="gallery-caption"><span>{String(index+1).padStart(2,'0')} /</span><h3>{p.title}</h3></div></a></article>)}</div>)}</div></div>
 <p className="gallery-hint">悬停暂停 · 点击图片查看完整作品 · 手机端可左右滑动</p></section>
 <section id="video-works" className="video-works section wrap"><div className="section-marker"><span>02.1 / MOTION & FILM</span><span>影像里的表达</span></div><div className="section-heading"><h2>视频<span className="serif">作品</span><sup> / 03</sup></h2><p>让静态的想象，在时间里展开。</p></div><div className="video-grid">{videos.map((video,index)=><article className="video-card" key={video.src}><video controls playsInline preload="metadata" poster={assetPath(`/video-posters/poster-${index+1}.jpg?v=2`)} aria-label={video.title} onPlay={event=>{document.querySelectorAll('video').forEach(player=>{if(player!==event.currentTarget)player.pause();});}}><source src={video.src} type="video/mp4"/>你的浏览器暂不支持视频播放，<a href={video.src}>下载视频</a>。</video><div className="video-caption"><span>{String(index+1).padStart(2,'0')} / FILM</span><h3>{video.title}</h3></div></article>)}</div></section>
 <AIShowcase />
 <PaintingGallery />
 <AwardsGallery />
 <section id="contact" className="contact"><div className="wrap"><div className="section-marker"><span>04 / GET IN TOUCH</span><span><i className="status-dot"/> 期待新的连接</span></div><div className="contact-heading"><h2>下一次灵感，<br/>从一句 <em>Hello.</em> 开始<span className="contact-star">✳</span></h2><p>关于创作、交流，或一个有趣的想法。<br/>很高兴与你相遇。</p></div><div className="contact-links"><div><span>EMAIL / 邮箱</span><p><a href="mailto:1963410987@qq.com">1963410987@qq.com <span aria-hidden="true">↗</span></a></p></div><div><span>PHONE / 电话</span><p><a href="tel:19893171667">19893171667 <span aria-hidden="true">↗</span></a></p></div></div><footer><a className="brand" href="#home">ShuiShui's space<span>*</span></a><span>© {new Date().getFullYear()} ShuiShui. 用好奇心创作。</span><a href="#home">回到顶部 ↑</a></footer></div></section>
 </main></>
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);

