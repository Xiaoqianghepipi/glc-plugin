import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { pluginVersion, resourceRootUrl } from './config.js'
import { getSettings } from './settings.js'
import { getCurrentYunzaiRuntimeInfo } from './yunzai-runtime.js'

export default async function render(e, path, renderData = {}, cfg = {}) {
  if (!e?.runtime) {
    console.log('未找到e.runtime，将使用 puppeteer 渲染')
  }

  function calcScale(pct = 1) {
    const settings = getSettings()
    const renderScale = Number.isInteger(settings.renderScale) ? settings.renderScale : 100
    const scale = Math.min(2, Math.max(0.5, renderScale / 100)) * pct

    return `style='transform: scale(${scale}); transform-origin: top left;'`
  }

  const scale = calcScale(cfg.scale || 1)
  const yunzaiRuntimeInfo = getCurrentYunzaiRuntimeInfo()

  const layoutPath = process.cwd() + '/plugins/glc-plugin/resources/common/layout/'
  renderData = {
    ...renderData,
    _res_path: resourceRootUrl,
    _layout_path: layoutPath,
    defaultLayout: layoutPath + 'default.html',
    sys: {
      ...(renderData.sys || {}),
      scale,
      copyright: `Created By ${yunzaiRuntimeInfo} & glc-plugin<span class="version">${pluginVersion}</span>`,
      createdby: `Created By ${yunzaiRuntimeInfo} & glc-plugin`,
    },
    Math,
    JSON,
    quality: 100,
  }

  return puppeteer.screenshot(path, renderData)
}

