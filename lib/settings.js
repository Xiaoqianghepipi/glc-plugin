import fs from 'fs'
import path from 'path'
import { pluginName } from './config.js'

const rootPath = process.cwd()
const settingsDir = path.join(rootPath, 'data', pluginName, 'config')
const settingsFile = path.join(settingsDir, 'settings.json')

const defaultSettings = {
  renderScale: 100,
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
    ensureSettingsFile()
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8')

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
