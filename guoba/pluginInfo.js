import path from 'path'
import { pluginName, pluginVersion, pluginRoot } from '../lib/config.js'

export default {
  name: pluginName,
  title: '归龙潮插件',
  showInMenu: true,
  description: '基于Yunzai的归龙潮游戏助手插件',
  author: ['@xiaoqianghepipi'],
  authorLink: ['https://github.com/xiaoqianghepipi'],
  isV2: false,
  isV3: true,
  version: pluginVersion,
  icon: 'mdi:gamepad-variant',
  iconColor: '#f59e0b',
  iconPath: path.join(pluginRoot, 'icon.png'),
  depends: [],
}
