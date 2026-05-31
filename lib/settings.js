import fs from 'fs'
import path from 'path'
import { pluginName } from './config.js'

const rootPath = process.cwd()
const settingsDir = path.join(rootPath, 'data', pluginName, 'config')
const settingsFile = path.join(settingsDir, 'settings.json')

const defaultSettings = {
  renderScale: 100,
  gachaAutoFetchEnabled: false,
  gachaAutoFetchCron: '0 30 12 * * ? *',
  gachaAutoFetchUrl: 'https://github.com/Xiaoqianghepipi/glc-plugin/blob/main/resources/gacha/gacha.json',
}

function ensureSettingsFile() {
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true })
  }

  if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2), 'utf8')
  }
}

export function getSettings() {
  try {
    ensureSettingsFile()
    const content = fs.readFileSync(settingsFile, 'utf8')
    const parsed = JSON.parse(content)
    return {
      ...defaultSettings,
      ...parsed,
    }
  } catch (err) {
    logger.warn('[归龙潮插件] 读取设置失败，使用默认配置。', err)
    return { ...defaultSettings }
  }
}

function saveSettings(nextSettings) {
  try {
    ensureSettingsFile()
    fs.writeFileSync(settingsFile, JSON.stringify(nextSettings, null, 2), 'utf8')
    return { ok: true }
  } catch (err) {
    logger.error('[归龙潮插件] 保存设置失败:', err)
    return { ok: false, message: `保存失败：${err.message}` }
  }
}

function normalizeCron(cron) {
  return String(cron || '').trim().replace(/\s+/g, ' ')
}

function validateCron(cron) {
  if (!cron) {
    return 'Cron 不能为空。'
  }

  const parts = cron.split(' ')
  if (parts.length !== 7) {
    return 'Cron 格式不正确，应为 Quartz 7 段表达式。'
  }

  const hasQuestion = parts.includes('?')
  if (!hasQuestion) {
    return 'Cron 格式不正确，应包含 ? 占位符。'
  }

  return ''
}

export function setRenderScale(scale) {
  const value = Number(scale)

  if (!Number.isInteger(value) || value < 50 || value > 200) {
    return {
      ok: false,
      message: '渲染精度必须是 50~200 的整数。',
    }
  }

  try {
    const settings = getSettings()
    settings.renderScale = value
    const saved = saveSettings(settings)
    if (!saved.ok) {
      return {
        ok: false,
        message: saved.message,
      }
    }

    return {
      ok: true,
      value,
      message: `渲染精度已设置为 ${value}%。`,
    }
  } catch (err) {
    logger.error('[归龙潮插件] 保存渲染精度失败:', err)
    return {
      ok: false,
      message: `保存失败：${err.message}`,
    }
  }
}

export function setGachaAutoFetchEnabled(enabled) {
  const value = Boolean(enabled)

  const settings = getSettings()
  settings.gachaAutoFetchEnabled = value
  const saved = saveSettings(settings)

  if (!saved.ok) {
    return {
      ok: false,
      message: saved.message,
    }
  }

  return {
    ok: true,
    value,
    message: value ? '已开启卡池定时拉取。' : '已关闭卡池定时拉取。',
  }
}

export function setGachaAutoFetchCron(cron) {
  const value = normalizeCron(cron)
  const validationError = validateCron(value)

  if (validationError) {
    return {
      ok: false,
      message: validationError,
    }
  }

  const settings = getSettings()
  settings.gachaAutoFetchCron = value
  const saved = saveSettings(settings)

  if (!saved.ok) {
    return {
      ok: false,
      message: saved.message,
    }
  }

  return {
    ok: true,
    value,
    message: `卡池拉取 Cron 已设置为：${value}`,
  }
}

export function setGachaAutoFetchConfig(config) {
  const enabled = Boolean(config?.gachaAutoFetchEnabled)
  const cron = normalizeCron(config?.gachaAutoFetchCron || defaultSettings.gachaAutoFetchCron)
  const url = String(config?.gachaAutoFetchUrl || defaultSettings.gachaAutoFetchUrl).trim()
  const validationError = validateCron(cron)

  if (validationError) {
    return {
      ok: false,
      message: validationError,
    }
  }

  if (!url) {
    return {
      ok: false,
      message: '卡池拉取地址不能为空。',
    }
  }

  const settings = getSettings()
  settings.gachaAutoFetchEnabled = enabled
  settings.gachaAutoFetchCron = cron
  settings.gachaAutoFetchUrl = url
  const saved = saveSettings(settings)

  if (!saved.ok) {
    return {
      ok: false,
      message: saved.message,
    }
  }

  return {
    ok: true,
    value: {
      gachaAutoFetchEnabled: enabled,
      gachaAutoFetchCron: cron,
      gachaAutoFetchUrl: url,
    },
    message: '卡池定时拉取设置已保存。',
  }
}
