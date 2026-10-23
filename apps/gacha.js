import plugin from '../../../lib/plugins/plugin.js'
import { buildGachaRenderData, hasMoreGacha } from '../lib/gacha-data.js'
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
          reg: '^[&＆](卡池|卡池轮换)$',
          fnc: 'sendGacha',
        },
        {
          reg: '^[&＆]最后复刻(的)?卡池$',
          fnc: 'sendLastGacha',
        },
      ],
    })
  }

  async sendGacha(e) {
    if (!hasMoreGacha()) {
      await e.reply(
        '归龙潮现已不再复刻角色，\n' +
        '如需查看最后这一个卡池，请发送「&最后复刻的卡池」或「&最后复刻卡池」。'
      )
      return true
    }

    return this.renderGacha(e)
  }

  async sendLastGacha(e) {
    return this.renderGacha(e, { last: true })
  }

  async renderGacha(e, options = {}) {
    try {
      const data = buildGachaRenderData(options)
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
