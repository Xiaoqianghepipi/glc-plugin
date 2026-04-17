import { pluginVersion } from './config.js'

export function buildHelpData() {
  return {
    tplFile: './plugins/glc-plugin/resources/help/index.html',
    saveId: 'index',
    title: '归龙潮插件帮助',
    helpCfg: {
      title: '归龙潮帮助',
      subTitle: `Yunzai-Bot & glc-plugin ${pluginVersion}`,
    },
    helpGroup: [
      {
        group: '基础功能',
        list: [
          { title: '&[角色名]攻略', desc: '发送对应角色的本地攻略图，例如 &导演攻略' },
          { title: '#归龙潮扫墓 / &扫墓', desc: '发送距离 2025.9.10 已过去时长的纪念图' },
          { title: '#归龙潮帮助 / &帮助', desc: '查看帮助菜单' },
        ]
      },
      {
        group: '管理功能',
        list: [
          { title: '#归龙潮更新 / &更新', desc: '拉取插件最新代码' },
          { title: '#归龙潮设置渲染精度 / &设置渲染精度 100', desc: '设置图片渲染精度，范围 50~200' },
          { title: '#归龙潮查看渲染精度 / &查看渲染精度', desc: '查看当前渲染精度' },
        ]
      }
    ],
    colCount: 2,
    bg: 'background.jpg',
  }
}
