# Komari Animal Island

使用 Animal Island UI 构建的温暖游戏风简单的Komari 监控主题。

## 功能

- 动物岛风格的监控概览、服务器卡片和详情弹窗
- 卡片与列表两种布局
- 地区筛选、服务器搜索、明暗模式和主题设置
- Komari RPC2 实时数据刷新，并兼容旧版实时接口
- 自定义左上角标题、描述和 PNG Logo
- Animal Island UI 表单、按钮、进度条、Loading、光标和返回顶部等组件

## 安装

下载发布页中的主题 ZIP，在 Komari 后台主题管理中上传并启用。

请使用 GitHub Release 中附带的 `AnimalIsland-版本号.zip`，不要使用 GitHub 自动生成的源码压缩包。

## 本地开发

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

将 `dist/`、`komari-theme.json` 和 `preview.png` 放在 ZIP 根目录即可安装。

## Komari 主题规范

本项目按 Komari 官方主题开发文档组织：

- 安装包根目录包含 `komari-theme.json`、`preview.png` 和 `dist/`。
- `dist/index.html` 保留 Komari 用于替换站点信息的标准标题与描述占位内容。
- 主题设置采用 `komari-theme.json` 的托管配置，并由前端读取公开主题设置。
- 主题只负责监控前台，不接管 `/admin` 和 `/terminal`。
- 页面保留 `Powered by Komari Monitor.` 标识。
- 页面主要结构使用 `km-` 语义类名，便于兼容和后续维护。

## 参考与致谢

感谢以下项目及其作者为本主题提供运行平台、组件和开发参考：

- [Komari](https://github.com/komari-monitor/komari)：本主题的运行平台。
- [Komari Web](https://github.com/komari-monitor/komari-web)：登录流程、公开接口与实时数据交互参考。
- [Komari 主题开发文档](https://komari-document.pages.dev/dev/theme)：主题结构、配置和发布规范依据。
- [Animal Island UI](https://github.com/guokaigdg/animal-island-ui)：本主题使用的界面组件库。
- [MiStatus-Komari](https://github.com/imzyb/MiStatus-Komari)：服务器信息布局与监控功能设计参考。

## 授权与声明

本项目采用 [CC BY-NC 4.0](LICENSE) 授权，仅限非商业用途，使用和再发布时请保留署名与许可证说明。

本项目是非官方同人主题，与 Nintendo Co., Ltd.（任天堂）及其关联公司没有隶属、授权、赞助或合作关系。“Animal Crossing / 动物森友会”等名称、角色、商标及相关素材的权利归其各自权利人所有。

第三方名称、商标、角色形象、远程图片和预览图中可能包含的第三方元素不属于本项目许可证的授权范围。公开发布、再分发或商业使用前，请自行确认已取得相应权利；建议替换为自行拥有权利的素材。

详细说明见 [NOTICE.md](NOTICE.md)。

