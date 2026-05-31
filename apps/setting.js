import plugin from '../../../lib/plugins/plugin.js'
import {
  getSettings,
  setRenderScale,
  setGachaAutoFetchEnabled,
  setGachaAutoFetchCron,
} from '../lib/settings.js'
import { refreshGachaSchedule } from '../lib/gacha-schedule.js'

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
        },
        {
          reg: '^[&＆](开启|关闭)卡池定时拉取$',
          fnc: 'toggleGachaAutoFetch',
          permission: 'master'
        },
        {
          reg: '^[&＆]设置卡池拉取cron\\s*(.+)$',
          fnc: 'setGachaCron',
          permission: 'master'
        },
        {
          reg: '^[&＆]查看卡池拉取结果$',
          fnc: 'showGachaAutoFetch'
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

  async toggleGachaAutoFetch(e) {
    const enable = /开启/.test(e.msg)
    const result = setGachaAutoFetchEnabled(enable)

    if (!result.ok) {
      await e.reply(result.message)
      return true
    }

    const scheduleResult = refreshGachaSchedule()
    const message = [result.message, scheduleResult.message].filter(Boolean).join('\n')
    await e.reply(message)
    return true
  }

  async setGachaCron(e) {
    const match = e.msg.match(/^[&＆]设置卡池拉取cron\s*(.+)$/)
    if (!match) return false

    const result = setGachaAutoFetchCron(match[1])
    if (!result.ok) {
      await e.reply(result.message)
      return true
    }

    const scheduleResult = refreshGachaSchedule()
    const message = [result.message, scheduleResult.message].filter(Boolean).join('\n')
    await e.reply(message)
    return true
  }

  async showGachaAutoFetch(e) {
    const settings = getSettings()
    const status = settings.gachaAutoFetchEnabled ? '已开启' : '已关闭'
    await e.reply(`卡池定时拉取：${status}\nQuartz Cron：${settings.gachaAutoFetchCron}`)
    return true
  }
}
