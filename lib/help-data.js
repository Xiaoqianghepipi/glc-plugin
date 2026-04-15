export function buildHelpData() {
  return {
    tplFile: './plugins/glc-plugin/resources/help/index.html',
    saveId: 'index',
    _res_path: '../../../plugins/glc-plugin/resources/',
    title: '归龙潮插件帮助',
    helpCfg: {
      title: '归龙潮向导',
      subTitle: 'glc-Plugin v1.0'
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
          { title: '#归龙潮设置', desc: '打开可视化面板' }
        ]
      }
    ],
    colCount: 2,
    bg: 'background.jpg'
  }
}
