import fs from 'fs'
import path from 'path'
import { pluginRoot } from './config.js'

const gachaFile = path.join(pluginRoot, 'resources', 'gacha', 'gacha.json')
const characterDetailDir = path.join(pluginRoot, 'resources', 'character-detail')

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDate(ms) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function readGachaList() {
  try {
    if (!fs.existsSync(gachaFile)) {
      return []
    }

    const content = fs.readFileSync(gachaFile, 'utf8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed?.gachas) ? parsed.gachas : []
  } catch (err) {
    logger.error('[归龙潮插件] 读取卡池配置失败:', err)
    return []
  }
}

function normalizeCharacterName(gacha) {
  if (typeof gacha?.character === 'string' && gacha.character.trim()) {
    return gacha.character.trim()
  }

  // 向后兼容对象格式：character: { name: '角色名' }
  if (gacha?.character && typeof gacha.character.name === 'string' && gacha.character.name.trim()) {
    return gacha.character.name.trim()
  }

  // 向后兼容旧格式：characters 数组取第一个有效角色名。
  if (Array.isArray(gacha?.characters)) {
    const first = gacha.characters.find((item) => item && item.name)
    if (first?.name) {
      return String(first.name).trim()
    }
  }

  return ''
}

function findCharacterImage(characterName) {
  if (!characterName || !fs.existsSync(characterDetailDir)) {
    return ''
  }

  try {
    const imageExtSet = new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif'])
    const files = fs.readdirSync(characterDetailDir)
    const matched = files.find((file) => {
      const parsed = path.parse(file)
      return parsed.name === characterName && imageExtSet.has(parsed.ext.toLowerCase())
    })

    return matched ? `character-detail/${matched}` : ''
  } catch (err) {
    logger.warn('[归龙潮插件] 读取角色详情图片目录失败:', err)
    return ''
  }
}

function normalizeGacha(gacha) {
  const startMs = Date.parse(gacha.start || '')
  const endMs = Date.parse(gacha.end || '')

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    return null
  }

  const characterName = normalizeCharacterName(gacha)

  return {
    name: gacha.name || '未命名卡池',
    banner: gacha.banner || '限定招募',
    startMs,
    endMs,
    characterName,
    characterImage: findCharacterImage(characterName),
  }
}

function pickGacha(normalizedGachaList, now) {
  const sorted = [...normalizedGachaList].sort((a, b) => a.startMs - b.startMs)
  const current = sorted.find((gacha) => now >= gacha.startMs && now <= gacha.endMs)

  if (current) {
    return {
      gacha: current,
      statusText: '当前卡池',
    }
  }

  // 先临时关闭“下期卡池”显示逻辑，避免在轮换规律未确定时误导展示。
  // const upcoming = sorted.find((gacha) => now < gacha.startMs)
  // if (upcoming) {
  //   return {
  //     gacha: upcoming,
  //     statusText: '下期卡池',
  //   }
  // }

  const latest = sorted[sorted.length - 1]
  if (latest) {
    return {
      gacha: latest,
      statusText: '最近一期卡池',
    }
  }

  return {
    gacha: null,
    statusText: '暂无卡池',
  }
}

export function buildGachaRenderData() {
  const now = Date.now()
  const nowText = formatDate(now)
  const normalizedGachaList = readGachaList().map(normalizeGacha).filter(Boolean)
  const selected = pickGacha(normalizedGachaList, now)

  if (!selected.gacha) {
    return {
      tplFile: './plugins/glc-plugin/resources/gacha/index.html',
      saveId: 'gacha',
      title: '归龙潮卡池',
      hasGacha: false,
      statusText: selected.statusText,
      nowText,
      gachaName: '-',
      banner: '-',
      startText: '-',
      endText: '-',
      characterName: '',
      characterImage: '',
    }
  }

  return {
    tplFile: './plugins/glc-plugin/resources/gacha/index.html',
    saveId: 'gacha',
    title: '归龙潮卡池',
    hasGacha: true,
    statusText: selected.statusText,
    nowText,
    gachaName: selected.gacha.name,
    banner: selected.gacha.banner,
    startText: formatDate(selected.gacha.startMs),
    endText: formatDate(selected.gacha.endMs),
    characterName: selected.gacha.characterName,
    characterImage: selected.gacha.characterImage,
  }
}