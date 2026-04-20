import plugin from '../../../lib/plugins/plugin.js'
import { getSettings, setRenderScale } from '../lib/settings.js'

export class Setting extends plugin {
  constructor() {
    super({
      name: '归龙潮插件-设置',
      dsc: '设置插件渲染参数',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^[&＆]设置渲染精度\\s*([0-9]{1,3})%?$',
          fnc: 'setScale',
          permission: 'master'
        },
        {
          reg: '^[&＆]查看渲染精度$',
          fnc: 'showScale'
        }
      ]
    })
  }

  async setScale(e) {
    const match = e.msg.match(/^[&＆]设置渲染精度\s*([0-9]{1,3})%?$/)
    if (!match) return false

    const result = setRenderScale(match[1])
    await e.reply(result.message)
    return true
  }

  async showScale(e) {
    const settings = getSettings()
    await e.reply(`当前图片渲染精度：${settings.renderScale}%`)
    return true
  }
}
