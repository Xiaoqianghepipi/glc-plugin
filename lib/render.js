import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { pluginVersion } from './config.js'
import { getSettings } from './settings.js'

export default async function render(e, path, renderData = {}, cfg = {}) {
  if (!e?.runtime) {
    console.log('未找到e.runtime，将使用 puppeteer 渲染')
  }
  
  function calcScale(pct = 1) {
    const settings = getSettings()
    let scale = Number.isInteger(settings.renderScale) ? settings.renderScale : 100
    scale = Math.min(2, Math.max(0.5, scale / 100))
    pct = pct * scale
    return `style='transform:scale(${pct})'`
  }
  const scale = calcScale(cfg.scale || 1)

  const layoutPath = process.cwd() + '/plugins/glc-plugin/resources/common/layout/'
  renderData = {
    ...renderData,
    _layout_path: layoutPath,
    defaultLayout: layoutPath + 'default.html',
    sys: {
      ...(renderData.sys || {}),
      scale,
      copyright: `Created By Yunzai-Bot & glc-plugin<span class="version">${pluginVersion}</span>`,
      createdby: 'Created By Yunzai-Bot & glc-plugin',
    },
    Math,
    JSON,
    quality: 100,
  }

  return puppeteer.screenshot(path, renderData)
}

