import { pluginVersion } from './config.js'

export function buildHelpData(settings = {}) {
  const renderScalePercent = Number.isInteger(settings.renderScale) ? settings.renderScale : 100
  const renderScale = (renderScalePercent / 100).toFixed(2)

  return {
    tplFile: './plugins/glc-plugin/resources/help/index.html',
    saveId: 'index',
    _res_path: '../../../plugins/glc-plugin/resources/',
    renderScale,
    renderScalePercent,
    title: '归龙潮插件帮助',
    helpCfg: {
      title: '归龙潮向导',
      subTitle: `glc-Plugin v${pluginVersion}`
    },
    helpGroup: [
      {
        group: '🎬 基础查询',
        list: [
          { title: '&[角色名]攻略', desc: '获取对应角色的攻略图 (如:&导演攻略)' },
          { title: '#归龙潮帮助 或 &帮助', desc: '查看本帮助菜单' }
        ]
      },
      {
        group: '⚙️ 管理设置 (画大饼)',
        list: [
          { title: '#归龙潮更新 或 &更新', desc: '更新插件' },
          { title: '#归龙潮设置精度 100', desc: '设置图片渲染精度 (0~200%)' },
          { title: '#归龙潮查看精度', desc: '查看当前渲染精度' }
        ]
      }
    ],
    colCount: 2,
    bg: 'background.jpg'
  }
}
