import plugin from '../../../lib/plugins/plugin.js'
import { buildMemorialData } from '../lib/memorial-data.js'
import render from '../lib/render.js'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatNow(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const h = pad2(d.getHours())
  const min = pad2(d.getMinutes())
  const s = pad2(d.getSeconds())

  return `${y}-${m}-${day} ${h}:${min}:${s}`
}

function calcElapsed() {
  const startTime = new Date('2025-09-10T00:00:00+08:00').getTime()
  const now = Date.now()
  const diff = Math.max(0, now - startTime)

  const dayMs = 24 * 60 * 60 * 1000
  const hourMs = 60 * 60 * 1000
  const minuteMs = 60 * 1000

  const days = Math.floor(diff / dayMs)
  const hours = Math.floor((diff % dayMs) / hourMs)
  const minutes = Math.floor((diff % hourMs) / minuteMs)
  const seconds = Math.floor((diff % minuteMs) / 1000)

  return {
    targetDate: '2025.9.10',
    days,
    hours,
    minutes,
    seconds,
    nowText: formatNow(now),
  }
}

export class Memorial extends plugin {
  constructor() {
    super({
      name: '归龙潮插件-扫墓',
      dsc: '发送 2025.9.10 至今已过去时长的渲染图',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^(&扫墓|#?归龙潮扫墓)$',
          fnc: 'sendMemorial',
        },
      ],
    })
  }

  async sendMemorial(e) {
    try {
      const data = buildMemorialData(calcElapsed())
      const img = await render(e, 'memorial', data)

      if (img) {
        await e.reply(img)
      } else {
        await e.reply('扫墓图生成失败，请稍后再试。')
      }

      return true
    } catch (err) {
      logger.error('[归龙潮插件] 扫墓图渲染异常:', err)
      await e.reply(`扫墓图渲染异常：${err.message}`)
      return false
    }
  }
}
