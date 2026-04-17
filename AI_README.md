# glc-plugin AI 说明

本文档用于让 AI 快速理解 glc-plugin 的结构、职责边界和编辑约束。编辑此插件前，必须先阅读并遵守 yunzai-plugin-development skill。

## 项目定位

glc-plugin 是一个为 Yunzai-Bot 开发的归龙潮插件，核心能力包括攻略图发送、帮助页渲染、扫墓纪念、渲染精度配置和插件更新。

## 目录说明

- `index.js`：插件入口，统一导出 `Guide`、`Help`、`Memorial`、`Setting`、`Update`。
- `apps/`：业务功能模块，每个文件对应一个独立插件类。
- `lib/`：公共配置、渲染、资源查找、设置读写、帮助数据和更新逻辑。
- `resources/`：帮助页、扫墓页模板、公共布局、样式和攻略图片资源。
- `guoba/`：Guoba 配置面板支持。

## 插件架构

### 根目录

- `index.js`：只负责从 `apps/` 汇总导出（`Guide`、`Help`、`Memorial`、`Setting`、`Update`），不承载业务逻辑。
- `guoba.support.js`：对外导出 Guoba 支持入口。

### apps 目录

- `apps/guide.js`：攻略查询模块，命令为 `&[角色名]攻略`，从本地 `resources/guide/` 查找攻略图。
- `apps/help.js`：帮助页模块，命令为 `&帮助` 或 `#归龙潮帮助`，通过渲染器生成帮助图片。
- `apps/memorial.js`：扫墓纪念模块，支持多个关键词触发（见下文功能说明），生成距离指定日期已过去时长的纪念图。
- `apps/setting.js`：渲染精度设置模块，支持 `&设置渲染精度 <50-200>`、`#归龙潮设置渲染精度 <50-200>`、`&查看渲染精度`、`#归龙潮查看渲染精度`。
- `apps/update.js`：插件更新模块，支持 `&更新`、`#归龙潮更新`，仅 master 可用。

### lib 目录

- `lib/config.js`：插件名、版本、安装路径和资源路径常量。
- `lib/render.js`：通用渲染入口，封装 Puppeteer 截图和渲染倍率计算。
- `lib/help-data.js`：帮助页内容数据构造。
- `lib/memorial-data.js`：扫墓页内容数据构造。
- `lib/resource.js`：本地文件查找工具，按扩展名匹配攻略图。
- `lib/settings.js`：渲染精度的读取、校验和持久化。
- `lib/update.js`：插件更新逻辑，通常由更新命令调用。

### resources 目录

- `resources/common/layout/default.html`：公共 HTML 布局模板。
- `resources/common/common.css`：公共样式。
- `resources/help/index.html`：帮助页模板。
- `resources/help/index.css`：帮助页样式。
- `resources/help/imgs/`：帮助页图片资源。
- `resources/guide/`：攻略图片目录，文件名通常对应角色名或内容名。
- `resources/memorial/index.html`：扫墓页模板。
- `resources/memorial/index.css`：扫墓页样式。
- `resources/memorial/game-logo.png`：游戏图标（扫墓页显示）。

### guoba 目录

- `guoba/index.js`：Guoba 支持入口。
- `guoba/pluginInfo.js`：插件元信息。
- `guoba/configInfo.js`：配置项信息汇总。
- `guoba/schemas/index.js`：配置表单定义，当前仅包含 `renderScale`，标签为“帮助图渲染精度”。

## 功能与命令

### 攻略查询

- 命令：`&[角色名]攻略`
- 行为：从 `resources/guide/` 中查找对应名称的图片并直接发送。
- 支持格式：`.jpg`、`.png`、`.jpeg`、`.webp`

### 帮助页面

- 命令：`&帮助`、`#归龙潮帮助`
- 行为：读取 `lib/help-data.js` 生成页面数据，再通过 `lib/render.js` 渲染为图片。
- 说明：帮助页会显示当前插件功能、更新入口和渲染精度设置入口。

### 渲染精度设置

- 命令：`&设置渲染精度 <50-200>`、`#归龙潮设置渲染精度 <50-200>`
- 命令：`&查看渲染精度`、`#归龙潮查看渲染精度`
- 权限：设置命令仅 master 可用；查看命令所有用户可用。
- 行为：修改并持久化 `renderScale`，影响帮助图渲染倍率。
- Guoba：也可通过 Guoba 配置面板修改同一项设置。

### 扫墓纪念

- 命令：支持多个关键词，缩写形式 `&扫墓`、`&上香`、`&悼念`、`&纪念`、`&追悼`、`&怀念`；完整形式 `#归龙潮扫墓`、`#归龙潮上香`、`#归龙潮悼念`、`#归龙潮纪念`、`#归龙潮追悼`、`#归龙潮怀念`。
- 行为：计算自北京时间 2025-09-10 12:00:00 起至今已过去的天数、小时、分钟、秒，并渲染为图片发送。
- 说明：包含游戏图标、倒计时天数、详细时间差和统计时间戳。

### 插件更新

- 命令：`&更新`、`#归龙潮更新`
- 权限：仅 master 可用。
- 行为：执行插件更新，成功后 2 秒延迟再尝试通过 stdin 发送 `#重启`。
- 反馈：更新过程和结果通过聊天记录（合并转发）返回。

## 编辑规范

- 每个 `apps/` 文件保持单一职责，一个文件一个功能类。
- 根目录入口只做导出和组织，不堆业务实现。
- 公共逻辑优先下沉到 `lib/`，避免在功能类里重复实现。
- 帮助页与公共布局统一从 `resources/` 读取，路径保持稳定。
- 改动命令、配置项或资源路径时，要同步更新帮助页和本说明。
- 只要涉及本插件的代码编辑、重构、补充测试或文档改写，先读取 yunzai-plugin-development skill，再开始修改。

## 运行约定

- 插件运行于 Yunzai-Bot 进程内。
- 消息命中后由对应 `plugin` 类处理事件。
- 帮助图使用 Puppeteer 渲染生成。
- 攻略图通过本地文件查找后直接发送。
- 更新逻辑依赖 Git 拉取最新代码。
