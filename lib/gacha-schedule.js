import schedule from 'node-schedule'
import { getSettings } from './settings.js'
import { updateGachaDataFromRemote } from './gacha-data-update.js'

let gachaJob = null
let currentCron = ''

function stopJob() {
  if (gachaJob) {
    gachaJob.cancel()
    gachaJob = null
  }
}

async function runAutoFetch() {
  try {
    const settings = getSettings()
    const result = await updateGachaDataFromRemote(settings.gachaAutoFetchUrl)
    if (!result.ok) {
      logger.warn('[归龙潮插件] 定时拉取卡池失败：', result.message)
    } else {
      logger.info('[归龙潮插件] 定时拉取卡池成功：', result.message)
    }
  } catch (err) {
    logger.error('[归龙潮插件] 定时拉取卡池异常：', err)
  }
}

export function refreshGachaSchedule() {
  const settings = getSettings()
  const enabled = Boolean(settings.gachaAutoFetchEnabled)
  const cron = String(settings.gachaAutoFetchCron || '').trim()

  if (!enabled) {
    stopJob()
    currentCron = ''
    return { ok: true, message: '卡池定时拉取已关闭。' }
  }

  if (!cron) {
    stopJob()
    currentCron = ''
    return { ok: false, message: 'Cron 不能为空。' }
  }

  if (gachaJob && currentCron === cron) {
    return { ok: true, message: `卡池定时拉取保持启用，Cron: ${cron}` }
  }

  stopJob()
  gachaJob = schedule.scheduleJob(cron, runAutoFetch)

  if (!gachaJob) {
    currentCron = ''
    return { ok: false, message: 'Cron 格式不正确，无法创建定时任务。' }
  }

  currentCron = cron
  return { ok: true, message: `已启用卡池定时拉取，Cron: ${cron}` }
}

export function initGachaSchedule() {
  const result = refreshGachaSchedule()
  if (!result.ok) {
    logger.warn('[归龙潮插件] 初始化卡池定时拉取失败：', result.message)
  }
  return result
}
