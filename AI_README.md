# glc-plugin AI 说明

本文档用于让 AI 快速理解 glc-plugin 当前结构、命令规则和编辑约束。编辑此插件前，必须先阅读并遵守 yunzai-plugin-development skill。

## 项目定位

glc-plugin 是归龙潮主题的 Yunzai-Bot 插件，核心能力为：

- 本地攻略图检索发送
- 帮助页渲染
- 卡池轮换图渲染
- 扫墓纪念图渲染
- 渲染精度配置
- 插件更新

## 当前导出模块

index.js 统一导出以下模块：

- Guide
- Help
- Rip
- Gacha
- Setting
- Update

## 目录说明

- apps/: 业务插件类，每个文件一个功能模块
- lib/: 配置、数据构造、渲染、资源查找、设置与更新逻辑
- resources/: 模板、样式、图片资源
- guoba/: Guoba 面板适配

## apps 目录职责

- apps/guide.js: 攻略查询，命令为 &角色名攻略
- apps/help.js: 帮助页渲染，命令为 &帮助 或 #归龙潮帮助
- apps/gacha.js: 卡池轮换图渲染，命令为 &卡池 或 &卡池轮换
- apps/rip.js: 扫墓纪念图渲染，命令为 &扫墓、&上香、&悼念、&纪念、&追悼、&怀念
- apps/setting.js: 渲染精度设置与查看，命令为 &设置渲染精度 数值、&查看渲染精度
- apps/update.js: 插件更新，命令为 &更新（master）

## lib 目录关键文件

- lib/config.js: 插件名、版本、路径常量
- lib/render.js: 通用 Puppeteer 渲染入口
- lib/help-data.js: 帮助页数据构造
- lib/gacha-data.js: 卡池页数据构造与卡池选择逻辑
- lib/rip-data.js: 扫墓页数据构造
- lib/resource.js: 本地资源文件查找
- lib/settings.js: 渲染精度读写与校验
- lib/update.js: 更新逻辑

## resources 目录关键文件

- resources/common/layout/default.html: 公共布局模板
- resources/common/common.css: 公共样式
- resources/help/index.html 与 resources/help/index.css: 帮助页
- resources/gacha/index.html 与 resources/gacha/index.css: 卡池页
- resources/gacha/gacha.json: 卡池配置数据
- resources/gacha-character-detail/: 卡池角色图目录，按角色名子文件夹存放图片，系统会随机取一张
- resources/guide/: 攻略图目录
- resources/rip/index.html 与 resources/rip/index.css: 扫墓页
- resources/rip/game-logo.png: 扫墓页图标

## 命令规则

当前规则是：

- 绝大多数命令只保留 & 开头
- 唯一保留的 #归龙潮 前缀命令是 #归龙潮帮助

具体命令：

- &角色名攻略
- &帮助
- #归龙潮帮助
- &卡池
- &卡池轮换
- &扫墓、&上香、&悼念、&纪念、&追悼、&怀念
- &设置渲染精度 50-200
- &查看渲染精度
- &更新

## 卡池数据格式

resources/gacha/gacha.json 使用 gachas 数组，每个卡池项推荐字段：

- name: 卡池名称
- banner: 卡池副标题
- start: 开始时间（带时区）
- end: 结束时间（带时区）
- character: 角色名字符串

角色图片不在 gacha.json 中硬编码路径。系统会到 resources/gacha-character-detail 中按角色名子文件夹读取图片并随机抽取一张发送（支持 .webp .png .jpg .jpeg .gif）。

## 扫墓页面规则

- 时间基准为北京时间 2025-09-10 12:00:00
- 计算已过去的天、小时、分钟、秒
- 渲染模板路径为 resources/rip

## 编辑规范

- apps 保持单一职责，一个文件一个插件类
- 业务共用逻辑优先下沉到 lib，避免重复
- 命令、路径、资源目录调整后，必须同步更新帮助数据和本说明
- 文档内容必须与代码现状一致，优先以 apps、lib、resources 的实际实现为准

## 运行约定

- 插件运行于 Yunzai-Bot 进程内
- 命中规则后由对应 plugin 类处理
- 页面类输出统一走 render + Puppeteer
- 更新命令成功后会延迟 2 秒后尝试发送 #重启
