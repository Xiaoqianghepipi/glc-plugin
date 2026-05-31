import plugin from '../../../lib/plugins/plugin.js'
import { updateGachaDataFromRemote } from '../lib/gacha-data-update.js'
import { initGachaSchedule } from '../lib/gacha-schedule.js'
import { getSettings } from '../lib/settings.js'

export class GachaDataUpdate extends plugin {
  constructor() {
    super({
      name: '归龙潮插件-卡池更新',
      dsc: '从云端拉取最新卡池信息',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^[&＆]拉取最新卡池$',
          fnc: 'updateGacha',
          permission: 'master',
        },
      ],
    })

    initGachaSchedule()
  }

  async updateGacha(e) {
    try {
      await e.reply('正在拉取最新卡池信息，请稍候...')

      const settings = getSettings()
      const result = await updateGachaDataFromRemote(settings.gachaAutoFetchUrl)
      if (result.ok) {
        await e.reply(result.message)
      } else {
        await e.reply(`卡池更新失败：${result.message}`)
      }

      return result.ok
    } catch (err) {
      logger.error('[归龙潮插件] 拉取最新卡池异常:', err)
      await e.reply(`卡池更新异常：${err.message}`)
      return false
    }
  }
}
