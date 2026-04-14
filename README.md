# glc-plugin
glc-plugin 是一个为 Yunzai-Bot 开发的 归龙潮（果粒橙） 游戏插件
~~# 为什么是空的？~~
~~因为我还没有开始写这个插件~~
# 现在开始写了

## 当前架构

- [apps/index.js](apps/index.js) 只负责插件注册和消息路由。
- [apps/services/guide.js](apps/services/guide.js) 负责攻略图查找与发送。
- [apps/services/help.js](apps/services/help.js) 负责帮助图数据组装与渲染。
- [apps/config.js](apps/config.js) 集中维护插件名和资源路径。
- [apps/utils/resource.js](apps/utils/resource.js) 提供本地资源查找能力。

## 资源目录

- [resources/help/index.html](resources/help/index.html) 是帮助页模板。
- [resources/help/index.css](resources/help/index.css) 是帮助页样式。
- [resources/common/layout/default.html](resources/common/layout/default.html) 是公共布局。
