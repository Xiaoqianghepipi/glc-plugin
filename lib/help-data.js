import { pluginName, resourceRootUrl } from './config.js'

export function buildHelpData() {
  return {
    tplFile: `./plugins/${pluginName}/resources/help/index.html`,
    defaultLayout: `./plugins/${pluginName}/resources/common/layout/default.html`,
    _res_path: resourceRootUrl,
    title: '归龙潮插件帮助',
    helpCfg: {
      title: '归龙潮向导',
      subTitle: 'Guilongchao-Plugin v1.0'
    },
    helpGroup: [
      {
        group: '🎬 基础查询',
        list: [
          { title: '&[角色名]攻略', desc: '获取对应角色的攻略图 (如:&导演攻略)' },
          { title: '&帮助', desc: '查看本帮助菜单' }
        ]
      },
      {
        group: '⚙️ 管理设置 (画大饼)',
        list: [
          { title: '#归龙潮更新', desc: '更新插件' },
          { title: '#归龙潮设置', desc: '打开可视化面板' }
        ]
      }
    ],
    colCount: 2,
    bg: 'background.jpg'
  }
}
