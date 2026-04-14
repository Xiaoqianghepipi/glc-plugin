import plugin from '../../lib/plugins/plugin.js'
import { sendGuide } from './services/guide.js'
import { sendHelp } from './services/help.js'

export class Guilongchao extends plugin {
  constructor() {
    super({
      name: '归龙潮插件',
      dsc: '读取本地目录发送攻略及动态渲染帮助图',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^&(.+)攻略$',
          fnc: 'sendGuide'
        },
        {
          reg: '^(&帮助|#?归龙潮帮助)$',
          fnc: 'sendHelp'
        }
      ]
    })
  }

  async sendGuide(e) {
    return sendGuide(e)
  }

  async sendHelp(e) {
    return sendHelp(e)
  }
}
