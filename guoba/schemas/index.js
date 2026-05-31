import { getSettings, setRenderScale, setGachaAutoFetchConfig } from '../../lib/settings.js'
import { refreshGachaSchedule } from '../../lib/gacha-schedule.js'

export const schemas = [
  {
    field: 'renderScale',
    label: '帮助图渲染精度',
    component: 'InputNumber',
    required: true,
    min: 50,
    max: 200,
    step: 1,
    defaultValue: 100,
    bottomHelpMessage: '范围 50~200，数值越大图片越清晰，但是渲染耗时也会增加。',
  },
  {
    field: 'gachaAutoFetchEnabled',
    label: '卡池定时拉取',
    component: 'Switch',
    defaultValue: '0 30 12 * * ? *',
    bottomHelpMessage: 'Quartz Cron（7 段），默认每天 12:30。',
    bottomHelpMessage: '开启后定时拉取最新卡池信息。',
  },
  {
    field: 'gachaAutoFetchCron',
    label: '卡池拉取 Cron',
    component: 'EasyCron',
    required: true,
    defaultValue: '30 12 * * *',
    bottomHelpMessage: '默认每天12:30拉取一次。',
  },
  {
    field: 'gachaAutoFetchUrl',
    label: '卡池拉取地址',
    component: 'Input',
    required: true,
    defaultValue: 'https://github.com/Xiaoqianghepipi/glc-plugin/blob/main/resources/gacha/gacha.json',
    bottomHelpMessage: '云端 gacha.json 地址。',
  },
]

export function getConfigData() {
  const settings = getSettings()
  return {
    renderScale: settings.renderScale,
    gachaAutoFetchEnabled: settings.gachaAutoFetchEnabled,
    gachaAutoFetchCron: settings.gachaAutoFetchCron,
    gachaAutoFetchUrl: settings.gachaAutoFetchUrl,
  }
}

export function setConfigData(data, ctx = {}) {
  const nextScale = Number(data?.renderScale)
  const result = setRenderScale(nextScale)

  if (!result.ok) {
    if (ctx.Result?.error) {
      return ctx.Result.error(result.message)
    }

    return {
      ok: false,
      message: result.message,
    }
  }

  const gachaResult = setGachaAutoFetchConfig({
    gachaAutoFetchEnabled: data?.gachaAutoFetchEnabled,
    gachaAutoFetchCron: data?.gachaAutoFetchCron,
    gachaAutoFetchUrl: data?.gachaAutoFetchUrl,
  })

  if (!gachaResult.ok) {
    if (ctx.Result?.error) {
      return ctx.Result.error(gachaResult.message)
    }

    return {
      ok: false,
      message: gachaResult.message,
    }
  }

  const scheduleResult = refreshGachaSchedule()
  const mergedMessage = [result.message, gachaResult.message, scheduleResult.message]
    .filter(Boolean)
    .join('\n')

  if (result.ok) {
    if (ctx.Result?.ok) {
      return ctx.Result.ok({
        renderScale: result.value,
        gachaAutoFetchEnabled: gachaResult.value.gachaAutoFetchEnabled,
        gachaAutoFetchCron: gachaResult.value.gachaAutoFetchCron,
        gachaAutoFetchUrl: gachaResult.value.gachaAutoFetchUrl,
      }, mergedMessage || result.message)
    }

    return {
      ok: true,
      message: mergedMessage || result.message,
      data: {
        renderScale: result.value,
        gachaAutoFetchEnabled: gachaResult.value.gachaAutoFetchEnabled,
        gachaAutoFetchCron: gachaResult.value.gachaAutoFetchCron,
        gachaAutoFetchUrl: gachaResult.value.gachaAutoFetchUrl,
      },
    }
  }
}
