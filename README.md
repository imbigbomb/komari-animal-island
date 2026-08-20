# Komari Animal Island

[简体中文](README.md) | [English](README_EN.md)

![Komari Animal Island 预览](preview.png)

使用 Animal Island UI 构建的温暖游戏风简单的 Komari 监控主题。

作者：**JeraldMaster**<br>
开发：**OpenAI Codex**

## 功能

- 动物岛风格的监控概览、服务器卡片、列表和详情弹窗
- Komari RPC2 实时数据刷新，并兼容旧版实时接口
- 自定义数据刷新间隔，默认 3 秒
- 名称、CPU、内存和网络速率排序，可默认将离线节点后置
- 地区筛选、服务器搜索、明暗模式和托管主题设置
- 单线路延迟及按任务名称匹配的三网延迟显示
- 服务器计费周期、续期日期、剩余价值和 Animal Island UI Wallet
- 自定义标题、描述和 PNG Logo
- ICP 备案与公安备案页脚显示
- Animal Island UI 的表单、按钮、标签、选择器、进度条、Wallet、Loading、光标、返回顶部等组件

## 安装

从 [Releases](https://github.com/imbigbomb/komari-animal-island/releases) 下载最新的 `AnimalIsland-版本号.zip`，在 Komari 后台的主题管理中上传并启用。

请勿使用 GitHub 自动生成的 Source code 压缩包。

## 本地开发

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

Komari 安装包根目录应包含：

```text
komari-theme.json
preview.png
dist/
```

## 主题规范

- 使用 `komari-theme.json` 提供托管主题配置。
- `dist/index.html` 保留 Komari 使用的标准站点信息占位内容。
- 主题只负责监控前台，不接管 `/admin` 与 `/terminal`。
- 页面保留 `Powered by Komari Monitor.` 标识。
- 页面主要结构使用 `km-` 语义类名，便于兼容和维护。

## 参考与致谢

感谢以下项目及其作者提供运行平台、组件和功能设计参考：

- [Komari](https://github.com/komari-monitor/komari)：主题运行平台与监控数据接口。
- [Komari Web](https://github.com/komari-monitor/komari-web)：登录流程、公开接口和实时数据交互参考。
- [Komari 主题开发文档](https://komari-document.pages.dev/dev/theme)：主题结构、托管配置和发布规范依据。
- [Animal Island UI](https://github.com/guokaigdg/animal-island-ui)：本主题使用的 UI 组件、图标、动效与视觉基础。
- [MiStatus-Komari](https://github.com/imzyb/MiStatus-Komari)：服务器监控信息组织、卡片与列表功能设计参考。
- [Komari Theme Emerald](https://github.com/Tokinx/komari-theme-emerald)：三网延迟任务读取与名称匹配、数据刷新间隔、离线节点后置、ICP 备案和公安备案设置的功能设计参考。

本主题使用 React 独立实现，没有复制 Komari Web、MiStatus-Komari 或 Komari Theme Emerald 的页面与组件代码。

## 授权与声明

本项目采用 [CC BY-NC 4.0](LICENSE) 授权，仅限非商业用途。使用和再发布时请保留署名与许可证说明。

本项目是非官方同人主题，与 Nintendo Co., Ltd.（任天堂）及其关联公司没有隶属、授权、赞助或合作关系。“Animal Crossing / 动物森友会”等名称、角色、商标及相关素材的权利归其各自权利人所有。

第三方名称、商标、角色形象、远程图片和预览图中可能包含的第三方元素不属于本项目许可证的授权范围。公开发布、再分发或商业使用前，请自行确认已取得相应权利；建议替换为自行拥有权利的素材。

详细说明见 [NOTICE.md](NOTICE.md)。
