import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { buildHelpData } from '../lib/help-data.js'

export class Help extends plugin {
  constructor() {
    super({
      name: '归龙潮插件-帮助',
      dsc: '动态渲染帮助页',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^(&帮助|#?归龙潮帮助)$',
          fnc: 'sendHelp'
        }
      ]
    })
  }

  async sendHelp(e) {
    try {
      logger.info('[归龙潮插件] 正在动态生成帮助图...')

      const img = await puppeteer.screenshot('help', buildHelpData())

      if (img) {
        await e.reply(img)
      } else {
        await e.reply('帮助图生成失败，可能是模板错误或 Puppeteer 异常，请查看控制台日志。')
      }

      return true
    } catch (err) {
      logger.error('[归龙潮插件] 帮助图渲染异常:', err)
      await e.reply(`渲染异常: ${err.message}`)
      return false
    }
  }
}
