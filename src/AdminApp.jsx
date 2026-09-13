import React, { useEffect, useMemo, useRef, useState } from 'react';
import './admin.css';

const GITHUB_API = 'https://api.github.com';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const clone = value => JSON.parse(JSON.stringify(value));
const assetPath = path => {
  if (!path) return '';
  if (/^(blob:|data:|https?:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
};

const navItems = [
  ['overview', '概览', '⌂'],
  ['hero', '首页', '✦'],
  ['about', '个人介绍', '人'],
  ['works', '作品选集', '图'],
  ['videos', '视频作品', '▶'],
  ['ai', 'AI 创作', 'AI'],
  ['paintings', '绘画作品', '笔'],
  ['awards', '获奖证书', '奖'],
  ['contact', '联系方式', '信'],
];

const getAt = (object, path) => path.reduce((value, key) => value?.[key], object);

const validateContent = content => {
  const collections = [
    ['作品选集', content.works.items, ['title', 'src']],
    ['视频作品', content.videos.items, ['title', 'src', 'poster']],
    ['AI 图片', content.ai.images, ['title', 'src']],
    ['绘画作品', content.paintings.items, ['title', 'src']],
    ['获奖证书', content.awards.items, ['title', 'award', 'src']],
  ];
  for (const [label, items, required] of collections) {
    const invalidIndex = items.findIndex(item => required.some(key => !String(item[key] || '').trim()));
    if (invalidIndex >= 0) throw new Error(`${label}第 ${invalidIndex + 1} 项尚未填写完整。`);
  }
  if (!content.ai.images.length) throw new Error('AI 创作至少需要一张主视觉图片。');
  if (!content.ai.video.title || !content.ai.video.src || !content.ai.video.poster) throw new Error('AI 视频的名称、视频和封面需要填写完整。');
};

const extensionFor = file => {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName !== file.name.toLowerCase()) return fromName.replace(/[^a-z0-9]/g, '');
  const mimeExt = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4' };
  return mimeExt[file.type] || 'bin';
};

const safeStem = name => name
  .replace(/\.[^.]+$/, '')
  .normalize('NFKD')
  .replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 48) || 'media';

const fileToBase64 = async file => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
};

const createVideoPoster = file => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.src = url;

  const cleanup = () => URL.revokeObjectURL(url);
  const capture = () => {
    try {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const scale = Math.min(1, 1280 / width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        cleanup();
        if (!blob) reject(new Error('无法生成视频封面。'));
        else resolve(blob);
      }, 'image/jpeg', 0.86);
    } catch (error) {
      cleanup();
      reject(error);
    }
  };

  video.addEventListener('loadeddata', () => {
    if (video.duration > 0.08) {
      video.currentTime = Math.min(0.08, video.duration / 10);
    } else {
      capture();
    }
  }, { once: true });
  video.addEventListener('seeked', capture, { once: true });
  video.addEventListener('error', () => {
    cleanup();
    reject(new Error('无法读取这个视频，请换一个 MP4 文件。'));
  }, { once: true });
});

function Field({ label, value, onChange, multiline = false, hint, type = 'text' }) {
  const Element = multiline ? 'textarea' : 'input';
  return (
    <label className="admin-field">
      <span>{label}</span>
      <Element type={multiline ? undefined : type} autoComplete={type === 'password' ? 'new-password' : undefined} value={value ?? ''} onChange={event => onChange(event.target.value)} rows={multiline ? 3 : undefined} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function MediaField({ label, value, preview, onFile, kind = 'image', hint }) {
  const accept = kind === 'video' ? 'video/mp4' : 'image/jpeg,image/png,image/webp';
  const source = preview || assetPath(value);
  return (
    <div className="admin-media-field">
      <div className="admin-media-preview">
        {kind === 'video'
          ? <video src={source} muted playsInline controls={false} />
          : <img src={source} alt="" />}
      </div>
      <div>
        <strong>{label}</strong>
        <p>{value || '尚未选择文件'}</p>
        <label className="admin-upload-button">
          选择{kind === 'video' ? '视频' : '图片'}
          <input type="file" accept={accept} onChange={event => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.target.value = '';
          }} />
        </label>
        <small>{hint || (kind === 'video' ? '支持 MP4，建议小于 25 MB，最大 50 MB。' : '支持 JPG、PNG、WebP。')}</small>
      </div>
    </div>
  );
}

function EditorSection({ eyebrow, title, description, children }) {
  return (
    <section className="admin-editor-section">
      <header>
        <div>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function StringListEditor({ title, values, onChange, placeholder = '输入内容' }) {
  const move = (index, offset) => {
    const next = [...values];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="admin-list-block">
      <div className="admin-list-heading"><h2>{title}</h2><span>{values.length} 项</span></div>
      <div className="admin-string-list">
        {values.map((value, index) => (
          <div className="admin-string-row" key={`${index}-${value.slice(0, 12)}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <textarea value={value} placeholder={placeholder} rows="2" onChange={event => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }} />
            <div className="admin-row-actions">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="上移">↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === values.length - 1} aria-label="下移">↓</button>
              <button type="button" className="danger" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} aria-label="删除">×</button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="admin-add-button" onClick={() => onChange([...values, ''])}>＋ 添加一项</button>
    </div>
  );
}

function CollectionEditor({ title, items, fields, onChange, onMedia, previews, addLabel = '添加作品' }) {
  const updateItem = (index, key, value) => {
    const next = clone(items);
    next[index][key] = value;
    onChange(next);
  };
  const move = (index, offset) => {
    const next = [...items];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="admin-list-block">
      <div className="admin-list-heading"><h2>{title}</h2><span>{items.length} 项 · 可排序</span></div>
      <div className="admin-collection">
        {items.map((item, index) => (
          <article className="admin-item-card" key={`${index}-${item.src || item.title}`}>
            <div className="admin-item-head">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.title || `未命名${addLabel}`}</strong>
              <div className="admin-row-actions">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="上移">↑</button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="下移">↓</button>
                <button type="button" className="danger" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} aria-label="删除">×</button>
              </div>
            </div>
            <div className="admin-item-fields">
              {fields.map(field => field.type === 'media' ? (
                <MediaField
                  key={field.key}
                  label={field.label}
                  value={item[field.key]}
                  preview={previews[item[field.key]]}
                  kind={field.kind}
                  hint={field.hint}
                  onFile={file => onMedia(file, index, field)}
                />
              ) : (
                <Field
                  key={field.key}
                  label={field.label}
                  value={item[field.key]}
                  multiline={field.multiline}
                  onChange={value => updateItem(index, field.key, value)}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="admin-add-button" onClick={() => {
        const newItem = {};
        fields.forEach(field => { newItem[field.key] = ''; });
        onChange([...items, newItem]);
      }}>＋ {addLabel}</button>
    </div>
  );
}

export default function AdminApp({ initialContent }) {
  const [draft, setDraft] = useState(() => clone(initialContent));
  const [section, setSection] = useState('overview');
  const [token, setToken] = useState('');
  const [account, setAccount] = useState(null);
  const [pendingFiles, setPendingFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [publishing, setPublishing] = useState(false);
  const baseline = useRef(JSON.stringify(initialContent));
  const isDirty = useMemo(() => JSON.stringify(draft) !== baseline.current || Object.keys(pendingFiles).length > 0, [draft, pendingFiles]);

  useEffect(() => {
    const handleBeforeUnload = event => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const update = (path, value) => {
    setDraft(previous => {
      const next = clone(previous);
      let cursor = next;
      path.slice(0, -1).forEach(key => { cursor = cursor[key]; });
      cursor[path.at(-1)] = value;
      return next;
    });
  };

  const addPendingFile = (file, bucket) => {
    if (file.size > MAX_FILE_SIZE) throw new Error('文件超过 50 MB，请压缩后再上传。');
    const extension = extensionFor(file);
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const repoPath = `public/uploads/${bucket}/${stamp}-${safeStem(file.name)}.${extension}`;
    const publicPath = `/${repoPath.replace(/^public\//, '')}`;
    const preview = URL.createObjectURL(file);
    setPendingFiles(previous => ({ ...previous, [repoPath]: file }));
    setPreviews(previous => ({ ...previous, [publicPath]: preview }));
    return { repoPath, publicPath };
  };

  const uploadForPath = async (file, path, options = {}) => {
    try {
      const bucket = options.bucket || path[0];
      const uploaded = addPendingFile(file, bucket);
      update(path, uploaded.publicPath);
      setStatus({ type: 'info', message: `${file.name} 已加入待发布内容。` });

      if (options.posterPath && file.type.startsWith('video/')) {
        setStatus({ type: 'info', message: '视频已选择，正在提取第一帧封面…' });
        const blob = await createVideoPoster(file);
        const posterFile = new File([blob], `${safeStem(file.name)}-poster.jpg`, { type: 'image/jpeg' });
        const poster = addPendingFile(posterFile, bucket);
        update(options.posterPath, poster.publicPath);
        setStatus({ type: 'success', message: '视频和第一帧封面已加入待发布内容。' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const uploadCollectionFile = async (rootPath, file, index, field) => {
    const itemPath = [...rootPath, index, field.key];
    const posterPath = field.posterKey ? [...rootPath, index, field.posterKey] : undefined;
    await uploadForPath(file, itemPath, { bucket: rootPath[0], posterPath });
  };

  const githubFetch = async (path, options = {}) => {
    const response = await fetch(`${GITHUB_API}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.trim()}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      let detail = '';
      try { detail = (await response.json()).message; } catch { detail = response.statusText; }
      throw new Error(`${detail || 'GitHub 请求失败'}（${response.status}）`);
    }
    if (response.status === 204) return null;
    return response.json();
  };

  const connectGithub = async () => {
    if (!token.trim()) {
      setStatus({ type: 'error', message: '请先粘贴 GitHub 访问令牌。' });
      return;
    }
    setStatus({ type: 'info', message: '正在验证 GitHub 连接…' });
    try {
      const user = await githubFetch('/user');
      const repo = await githubFetch(`/repos/${draft.settings.repository}`);
      setAccount({ login: user.login, avatar: user.avatar_url, permission: repo.permissions?.push });
      setStatus({ type: repo.permissions?.push ? 'success' : 'error', message: repo.permissions?.push ? `已连接 ${user.login}，可以发布修改。` : '令牌可以登录，但没有这个仓库的写入权限。' });
    } catch (error) {
      setAccount(null);
      setStatus({ type: 'error', message: `连接失败：${error.message}` });
    }
  };

  const publish = async () => {
    if (!account?.permission || publishing) return;
    if (!isDirty) {
      setStatus({ type: 'info', message: '当前没有需要发布的修改。' });
      return;
    }

    setPublishing(true);
    setStatus({ type: 'info', message: '正在整理内容并上传媒体…' });
    try {
      validateContent(draft);
      const [owner, repository] = draft.settings.repository.split('/');
      const branch = draft.settings.branch || 'main';
      const ref = await githubFetch(`/repos/${owner}/${repository}/git/ref/heads/${encodeURIComponent(branch)}`);
      const parentCommit = await githubFetch(`/repos/${owner}/${repository}/git/commits/${ref.object.sha}`);
      const contentText = `${JSON.stringify(draft, null, 2)}\n`;
      const contentBlob = await githubFetch(`/repos/${owner}/${repository}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: contentText, encoding: 'utf-8' }),
      });

      const fileEntries = Object.entries(pendingFiles);
      const uploadedBlobs = await Promise.all(fileEntries.map(async ([path, file]) => {
        setStatus({ type: 'info', message: `正在上传 ${file.name}…` });
        const blob = await githubFetch(`/repos/${owner}/${repository}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({ content: await fileToBase64(file), encoding: 'base64' }),
        });
        return { path, mode: '100644', type: 'blob', sha: blob.sha };
      }));

      setStatus({ type: 'info', message: '正在创建发布版本…' });
      const tree = await githubFetch(`/repos/${owner}/${repository}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({
          base_tree: parentCommit.tree.sha,
          tree: [
            { path: 'src/content.json', mode: '100644', type: 'blob', sha: contentBlob.sha },
            ...uploadedBlobs,
          ],
        }),
      });
      const commit = await githubFetch(`/repos/${owner}/${repository}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({
          message: `通过作品集后台更新内容 · ${new Date().toLocaleString('zh-CN')}`,
          tree: tree.sha,
          parents: [ref.object.sha],
        }),
      });
      await githubFetch(`/repos/${owner}/${repository}/git/refs/heads/${encodeURIComponent(branch)}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });

      baseline.current = JSON.stringify(draft);
      setPendingFiles({});
      setStatus({ type: 'success', message: '修改已提交。GitHub Pages 正在自动发布，通常 1–3 分钟后更新。' });
    } catch (error) {
      setStatus({ type: 'error', message: `发布失败：${error.message}` });
    } finally {
      setPublishing(false);
    }
  };

  const reset = () => {
    if (!window.confirm('放弃尚未发布的修改并恢复线上版本？')) return;
    setDraft(clone(initialContent));
    setPendingFiles({});
    setPreviews({});
    setStatus({ type: 'info', message: '已恢复为当前线上版本。' });
  };

  const textFields = (prefix, fields) => (
    <div className="admin-form-grid">
      {fields.map(field => <Field key={field.key} label={field.label} type={field.type} value={getAt(draft, [...prefix, field.key])} multiline={field.multiline} hint={field.hint} onChange={value => update([...prefix, field.key], value)} />)}
    </div>
  );

  const renderEditor = () => {
    if (section === 'overview') return (
      <EditorSection eyebrow="CONTENT STUDIO" title="作品集管理" description="修改文案、调整顺序或替换媒体，然后一次发布到线上。">
        <div className="admin-overview-grid">
          <article className="admin-overview-card admin-overview-feature">
            <span>当前网站</span><h2>{draft.settings.siteName}</h2>
            <p>所有改动将提交到 <strong>{draft.settings.repository}</strong> 的 <strong>{draft.settings.branch}</strong> 分支。</p>
            <div className="admin-overview-actions"><a href={draft.settings.siteUrl} target="_blank" rel="noreferrer">打开线上网站 ↗</a><a href={`https://github.com/${draft.settings.repository}/actions`} target="_blank" rel="noreferrer">查看发布进度 ↗</a></div>
          </article>
          <article className="admin-overview-card"><span>作品内容</span><strong className="admin-metric">{draft.works.items.length + draft.videos.items.length + draft.ai.images.length + 1 + draft.paintings.items.length}</strong><p>图片与视频作品</p></article>
          <article className="admin-overview-card"><span>荣誉记录</span><strong className="admin-metric">{draft.awards.items.length}</strong><p>获奖证书</p></article>
        </div>
        <div className="admin-guide">
          <h2>使用方法</h2>
          <ol><li>从左侧选择要修改的区域。</li><li>编辑文字、调整卡片顺序或选择新文件。</li><li>在右上角连接 GitHub，然后点击“发布修改”。</li></ol>
        </div>
      </EditorSection>
    );

    if (section === 'hero') return (
      <EditorSection eyebrow="01 / HOME" title="首页内容" description="调整第一屏的标题、介绍和主视觉。">
        {textFields(['hero'], [
          { key: 'eyebrow', label: '英文眉题' }, { key: 'year', label: '年份' },
          { key: 'titleLine1', label: '标题第一行' }, { key: 'titleLine2', label: '标题第二行前半' },
          { key: 'titleHighlight', label: '标题高亮文字' }, { key: 'displayName', label: '动态英文标题', multiline: true, hint: '换行会原样显示。' },
        ])}
        <StringListEditor title="首页介绍" values={draft.hero.description} onChange={value => update(['hero', 'description'], value)} />
        <MediaField label="首页人物形象" value={draft.hero.avatar} preview={previews[draft.hero.avatar]} onFile={file => uploadForPath(file, ['hero', 'avatar'], { bucket: 'hero' })} hint="建议使用透明背景 PNG 或 WebP。" />
        <Field label="人物图片替代文字" value={draft.hero.avatarAlt} onChange={value => update(['hero', 'avatarAlt'], value)} />
      </EditorSection>
    );

    if (section === 'about') return (
      <EditorSection eyebrow="02 / PROFILE" title="个人介绍" description="维护个人资料、教育经历、技能与代表荣誉。">
        <div className="admin-form-grid">
          <Field label="姓名" value={draft.about.name} onChange={value => update(['about', 'name'], value)} />
          <Field label="身份描述" value={draft.about.role} onChange={value => update(['about', 'role'], value)} />
          <Field label="照片标签" value={draft.about.photoLabel} onChange={value => update(['about', 'photoLabel'], value)} />
          <Field label="照片下方说明" value={draft.about.photoCaption} onChange={value => update(['about', 'photoCaption'], value)} />
        </div>
        <MediaField label="个人证件照" value={draft.about.portrait} preview={previews[draft.about.portrait]} onFile={file => uploadForPath(file, ['about', 'portrait'], { bucket: 'about' })} />
        <CollectionEditor title="基本信息" items={draft.about.facts} fields={[{ key: 'label', label: '项目' }, { key: 'value', label: '内容' }]} onChange={value => update(['about', 'facts'], value)} onMedia={() => {}} previews={previews} addLabel="添加信息" />
        <CollectionEditor title="教育经历" items={draft.about.education} fields={[{ key: 'period', label: '时间' }, { key: 'detail', label: '学校与专业' }]} onChange={value => update(['about', 'education'], value)} onMedia={() => {}} previews={previews} addLabel="添加经历" />
        <StringListEditor title="职业技能" values={draft.about.skills} onChange={value => update(['about', 'skills'], value)} />
        <StringListEditor title="代表荣誉" values={draft.about.honors} onChange={value => update(['about', 'honors'], value)} />
      </EditorSection>
    );

    if (section === 'works') return (
      <EditorSection eyebrow="03 / SELECTED WORKS" title="作品选集" description="管理首页横向滚动的图片作品。">
        {textFields(['works'], [
          { key: 'titleLine1', label: '标题第一行' }, { key: 'titleLine2', label: '标题第二行前半' },
          { key: 'titleHighlight', label: '标题高亮文字' }, { key: 'description', label: '区域说明', multiline: true },
        ])}
        <CollectionEditor title="图片作品" items={draft.works.items} fields={[{ key: 'src', label: '作品图片', type: 'media', kind: 'image' }, { key: 'title', label: '作品名称', multiline: true }]} onChange={value => update(['works', 'items'], value)} onMedia={(file, index, field) => uploadCollectionFile(['works', 'items'], file, index, field)} previews={previews} addLabel="添加图片作品" />
      </EditorSection>
    );

    if (section === 'videos') return (
      <EditorSection eyebrow="04 / MOTION & FILM" title="视频作品" description="替换视频时会自动提取第一帧作为封面。">
        {textFields(['videos'], [{ key: 'title', label: '区域标题' }, { key: 'description', label: '区域说明', multiline: true }])}
        <CollectionEditor title="视频列表" items={draft.videos.items} fields={[
          { key: 'src', label: '视频文件', type: 'media', kind: 'video', posterKey: 'poster' },
          { key: 'poster', label: '视频封面', type: 'media', kind: 'image' },
          { key: 'title', label: '视频名称', multiline: true },
        ]} onChange={value => update(['videos', 'items'], value)} onMedia={(file, index, field) => uploadCollectionFile(['videos', 'items'], file, index, field)} previews={previews} addLabel="添加视频" />
      </EditorSection>
    );

    if (section === 'ai') return (
      <EditorSection eyebrow="05 / AI VISUAL WORKS" title="AI 创作" description="管理 AI 项目的标题、三张图片与视频。">
        {textFields(['ai'], [{ key: 'title', label: '标题' }, { key: 'titleAccent', label: '标题高亮' }, { key: 'description', label: '项目说明', multiline: true }])}
        <CollectionEditor title="AI 图片" items={draft.ai.images} fields={[{ key: 'src', label: '图片', type: 'media', kind: 'image' }, { key: 'title', label: '图片名称' }, { key: 'label', label: '图片标注' }]} onChange={value => update(['ai', 'images'], value)} onMedia={(file, index, field) => uploadCollectionFile(['ai', 'images'], file, index, field)} previews={previews} addLabel="添加 AI 图片" />
        <div className="admin-list-block"><div className="admin-list-heading"><h2>AI 视频</h2><span>自动生成第一帧封面</span></div>
          <MediaField label="视频文件" value={draft.ai.video.src} preview={previews[draft.ai.video.src]} kind="video" onFile={file => uploadForPath(file, ['ai', 'video', 'src'], { bucket: 'ai', posterPath: ['ai', 'video', 'poster'] })} />
          <MediaField label="视频封面" value={draft.ai.video.poster} preview={previews[draft.ai.video.poster]} onFile={file => uploadForPath(file, ['ai', 'video', 'poster'], { bucket: 'ai' })} />
          <div className="admin-form-grid"><Field label="视频名称" value={draft.ai.video.title} onChange={value => update(['ai', 'video', 'title'], value)} /><Field label="视频标注" value={draft.ai.video.label} onChange={value => update(['ai', 'video', 'label'], value)} /></div>
        </div>
      </EditorSection>
    );

    if (section === 'paintings') return (
      <EditorSection eyebrow="06 / DRAWING & PAINTING" title="绘画作品" description="维护绘画区域文案、作品名称、分类标签和图片顺序。">
        {textFields(['paintings'], [{ key: 'titleLine1', label: '标题第一行' }, { key: 'titleLine2', label: '标题第二行前半' }, { key: 'titleHighlight', label: '标题高亮文字' }, { key: 'description', label: '区域说明', multiline: true }])}
        <CollectionEditor title="绘画列表" items={draft.paintings.items} fields={[{ key: 'src', label: '作品图片', type: 'media', kind: 'image' }, { key: 'title', label: '作品名称' }, { key: 'tag', label: '英文标签' }]} onChange={value => update(['paintings', 'items'], value)} onMedia={(file, index, field) => uploadCollectionFile(['paintings', 'items'], file, index, field)} previews={previews} addLabel="添加绘画作品" />
      </EditorSection>
    );

    if (section === 'awards') return (
      <EditorSection eyebrow="07 / RECOGNITION" title="获奖证书" description="编辑证书信息、替换图片并拖动式调整展示顺序。">
        {textFields(['awards'], [{ key: 'titleLine1', label: '标题第一行' }, { key: 'titleLine2', label: '标题第二行前半' }, { key: 'titleHighlight', label: '标题高亮文字' }, { key: 'description', label: '区域说明', multiline: true }])}
        <CollectionEditor title="证书列表" items={draft.awards.items} fields={[{ key: 'src', label: '证书图片', type: 'media', kind: 'image' }, { key: 'title', label: '证书名称', multiline: true }, { key: 'award', label: '奖项说明' }]} onChange={value => update(['awards', 'items'], value)} onMedia={(file, index, field) => uploadCollectionFile(['awards', 'items'], file, index, field)} previews={previews} addLabel="添加证书" />
      </EditorSection>
    );

    return (
      <EditorSection eyebrow="08 / CONTACT" title="联系方式" description="修改访客在页面底部看到的联系信息。">
        {textFields(['contact'], [{ key: 'email', label: '邮箱', type: 'email' }, { key: 'phone', label: '电话' }, { key: 'footer', label: '页脚署名' }])}
        <StringListEditor title="联系区介绍" values={draft.contact.description} onChange={value => update(['contact', 'description'], value)} />
      </EditorSection>
    );
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="#home"><b>S</b><span>ShuiShui<br /><small>CONTENT STUDIO</small></span></a>
        <nav aria-label="管理后台导航">
          {navItems.map(([id, label, icon]) => <button type="button" key={id} className={section === id ? 'active' : ''} onClick={() => { setSection(id); window.scrollTo(0, 0); }}><span>{icon}</span>{label}</button>)}
        </nav>
        <a className="admin-back-link" href="#home">← 返回作品集</a>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-save-state"><i className={isDirty ? 'dirty' : ''} />{isDirty ? '有未发布的修改' : '内容已同步'}</div>
          <div className="admin-top-actions">
            {account ? <div className="admin-account"><img src={account.avatar} alt="" /><span>{account.login}</span><button type="button" onClick={() => { setAccount(null); setToken(''); }}>断开</button></div> : <details className="admin-connect">
              <summary>连接 GitHub</summary>
              <div className="admin-connect-popover">
                <h2>连接内容仓库</h2>
                <p>令牌只保存在当前页面内，用于把修改提交到 {draft.settings.repository}。</p>
                <Field label="Fine-grained token" type="password" value={token} onChange={setToken} hint="仓库权限只需 Contents：Read and write。" />
                <button type="button" onClick={connectGithub}>验证并连接</button>
                <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">创建 GitHub 令牌 ↗</a>
              </div>
            </details>}
            <button type="button" className="admin-reset" onClick={reset} disabled={!isDirty}>撤销修改</button>
            <button type="button" className="admin-publish" onClick={publish} disabled={!account?.permission || !isDirty || publishing}>{publishing ? '正在发布…' : '发布修改'}</button>
          </div>
        </header>

        <main className="admin-main">
          {status.message && <div className={`admin-notice ${status.type}`} role="status"><span>{status.type === 'success' ? '✓' : status.type === 'error' ? '!' : '·'}</span>{status.message}<button type="button" onClick={() => setStatus({ type: 'idle', message: '' })} aria-label="关闭提示">×</button></div>}
          {renderEditor()}
        </main>
      </div>
    </div>
  );
}
