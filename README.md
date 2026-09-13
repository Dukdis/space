# ShuiShui's space

数字媒体艺术个人作品集，使用 React + Vite 构建，包含个人履历、静态作品、视频作品、AI 创作、绘画作品、获奖证书及联系方式。

在线访问：[Dukdis.github.io/space](https://dukdis.github.io/space/)

## 内容管理后台

线上管理入口：[Dukdis.github.io/space/#/admin](https://dukdis.github.io/space/#/admin)

后台可以修改首页、个人介绍、作品选集、视频、AI 创作、绘画、获奖证书和联系方式，也可以新增、删除、排序或替换作品。上传视频时会自动截取第一帧作为封面。

发布前需要连接 GitHub：

1. 创建 Fine-grained personal access token。
2. Repository access 只选择 Dukdis/space。
3. Repository permissions 中将 Contents 设置为 Read and write。
4. 把令牌粘贴到后台的“连接 GitHub”面板并完成验证。
5. 修改内容后点击“发布修改”，GitHub Pages 会自动更新。

令牌只保存在当前管理页面的内存中，刷新或关闭页面后会清除。请勿把令牌写进仓库文件。

## 本地运行

npm install
npm run dev

## 生产构建

npm run build
npm run preview

网站会通过 GitHub Actions 自动构建并发布至 GitHub Pages。手机端采用响应式布局，并支持系统“减少动态效果”设置。
