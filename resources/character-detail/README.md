# character-detail 目录说明

该目录用于存放卡池角色详情图。

## 命名规则

- 图片文件名必须与角色名完全一致。
- 例如：
  - 角色名是 导演 -> 文件名可以是 导演.webp
  - 角色名是 语冰 -> 文件名可以是 语冰.png

## 支持格式

- .webp
- .png
- .jpg
- .jpeg
- .gif

## 卡池数据写法

在 resources/gacha/gacha.json 里，只需要填写角色名：

{
  "character": "导演"
}

插件会自动去本目录按角色名匹配同名图片。
