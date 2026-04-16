import { getSettings, setRenderScale } from '../../lib/settings.js'

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
]

export function getConfigData() {
  const settings = getSettings()
  return {
    renderScale: settings.renderScale,
  }
}

export function setConfigData(data, ctx = {}) {
  const nextScale = Number(data?.renderScale)
  const result = setRenderScale(nextScale)

  if (result.ok) {
    if (ctx.Result?.ok) {
      return ctx.Result.ok({
        renderScale: result.value,
      }, result.message)
    }

    return {
      ok: true,
      message: result.message,
      data: {
        renderScale: result.value,
      },
    }
  }

  if (ctx.Result?.error) {
    return ctx.Result.error(result.message)
  }

  return {
    ok: false,
    message: result.message,
  }
}
