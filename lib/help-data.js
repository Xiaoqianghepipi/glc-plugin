import { pluginVersion } from './config.js'
import { getCurrentYunzaiRuntimeInfo } from './yunzai-runtime.js'

export function buildHelpData() {
  const yunzaiRuntimeInfo = getCurrentYunzaiRuntimeInfo()

  return {
    tplFile: './plugins/glc-plugin/resources/help/index.html',
    saveId: 'index',
    title: '归龙潮插件帮助',
    helpCfg: {
      title: '归龙潮帮助',
      subTitle: `${yunzaiRuntimeInfo} & glc-plugin ${pluginVersion}`,
    },
    helpGroup: [
      {
        group: '基础功能',
        list: [
          { title: '&[角色名]攻略', desc: '发送对应角色攻略图，例如 &导演攻略' },
          { title: '&卡池', desc: '查看当前卡池' },
          { title: '&扫墓', desc: '给牢归上香' },
          { title: '&帮助', desc: '查看帮助菜单' },
        ]
      },
      {
        group: '管理功能，仅管理可用',
        list: [
          { title: '&更新', desc: '更新glc-plugin插件' },
          { title: '&强制更新', desc: '强制更新glc-plugin插件' },
          { title: '&设置渲染精度 100', desc: '设置图片渲染精度，范围 50~200' },
          { title: '&查看渲染精度', desc: '查看当前图片渲染精度' },
        ]
      }
    ],
    colCount: 2,
    bg: 'background.jpg',
  }
}
