# Komari Animal Island

使用 Animal Island UI 构建的温暖游戏风 Komari 监控主题。

## 功能

- 动物岛风格的监控概览、服务器卡片和详情弹窗
- 卡片与列表两种布局
- 地区筛选、服务器搜索、明暗模式和主题设置
- Komari RPC2 实时数据刷新，并兼容旧版实时接口
- 自定义左上角标题、描述和 PNG Logo
- Animal Island UI 表单、按钮、进度条、Loading、光标和返回顶部等组件

## 安装

下载发布页中的主题 ZIP，在 Komari 后台主题管理中上传并启用。

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

## 参考与致谢

- [Komari](https://github.com/komari-monitor/komari)：主题运行平台。
- [Komari Web](https://github.com/komari-monitor/komari-web)：仅参考公开接口、登录流程和实时数据功能行为，没有套用其页面代码。
- [Komari 主题开发文档](https://komari-document.pages.dev/dev/theme)：主题结构与配置依据。
- [Animal Island UI](https://github.com/guokaigdg/animal-island-ui)：本主题使用的界面组件库，采用 CC BY-NC 4.0。
- 本地 `mistatus-theme-v26.07.11-b265be5`：开发初期仅用于了解监控主题常见功能，没有复制或套用其代码。

本项目为独立编写的 Komari 主题，不是 Komari Web 或 MiStatus 主题的二次开发。

## 授权与声明

本项目采用 [CC BY-NC 4.0](LICENSE) 授权，仅限非商业用途，使用和再发布时请保留署名与许可证说明。

本项目是非官方同人主题，与 Nintendo Co., Ltd.（任天堂）及其关联公司没有隶属、授权、赞助或合作关系。“Animal Crossing / 动物森友会”等名称、角色、商标及相关素材的权利归其各自权利人所有。

第三方名称、商标、角色形象、远程图片和预览图中可能包含的第三方元素不属于本项目许可证的授权范围。公开发布、再分发或商业使用前，请自行确认已取得相应权利；建议替换为自行拥有权利的素材。

详细说明见 [NOTICE.md](NOTICE.md)。
