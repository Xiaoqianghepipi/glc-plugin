import plugin from '../../../lib/plugins/plugin.js'
import { buildGachaRenderData } from '../lib/gacha-data.js'
import render from '../lib/render.js'

export class Gacha extends plugin {
  constructor() {
    super({
      name: '归龙潮插件-卡池',
      dsc: '查看当前卡池轮换信息',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^(&(卡池|卡池轮换)|#?归龙潮(卡池|卡池轮换))$',
          fnc: 'sendGacha',
        },
      ],
    })
  }

  async sendGacha(e) {
    try {
      const data = buildGachaRenderData()
      const img = await render(e, 'gacha', data)

      if (img) {
        await e.reply(img)
      } else {
        await e.reply('卡池信息渲染失败，请稍后再试。')
      }

      return true
    } catch (err) {
      logger.error('[归龙潮插件] 卡池图渲染异常:', err)
      await e.reply(`卡池图渲染异常：${err.message}`)
      return false
    }
  }
}