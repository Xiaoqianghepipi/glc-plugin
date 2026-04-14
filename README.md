# glc-plugin

glc-plugin 是一个为 Yunzai-Bot 开发的 归龙潮（果粒橙） 游戏插件

## 插件结构与规范

本插件按照 [Yunzai 官方目录规范](https://yunzai-bot.com/dev/folder.html) 组织：

### 根目录
- **index.js** - 插件入口，汇总导出 `apps` 中的所有类

### apps 目录（功能模块）
- **guide.js** - 攻略查询功能模块，导出 `Guide` 类
- **help.js** - 帮助页面功能模块，导出 `Help` 类

### lib 目录（底层公共库）
- **config.js** - 配置常量（插件名、路径等）
- **help-data.js** - 帮助页面数据构造函数
- **resource.js** - 本地资源查找工具函数

### resources 目录（静态资源）
- **help/** - 帮助页面的 HTML 模板和样式
- **common/** - 模板公共布局

### 项目配置
- **package.json** - 项目元数据，main 指向 `index.js`

## 功能说明

1. **攻略查询** (`&[角色名]攻略`)
   - 从 `resources/guide/` 目录读取对应角色的攻略图
   - 支持 `.jpg`、`.png`、`.jpeg`、`.webp` 格式

2. **帮助页面** (`&帮助` 或 `#归龙潮帮助`)
   - 动态渲染 HTML 模板生成帮助图
   - 使用 Puppeteer 截图生成
