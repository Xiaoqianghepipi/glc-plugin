import fs from 'fs'
import path from 'path'
import { pluginRoot } from './config.js'

const gachaFile = path.join(pluginRoot, 'resources', 'gacha', 'gacha.json')
const gachaCharacterDetailDir = path.join(pluginRoot, 'resources', 'gacha', 'imgs', 'character-detail')
const backgroundDir = path.join(pluginRoot, 'resources', 'common', 'imgs', 'background', 'default')
const supportedImageExtSet = new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif'])

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDate(ms) {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function formatShortDate(ms) {
  const d = new Date(ms)
  return `${pad2(d.getMonth() + 1)}月${pad2(d.getDate())}日`
}

function getBackgroundImageList() {
  try {
    if (!fs.existsSync(backgroundDir)) {
      return []
    }

    return fs.readdirSync(backgroundDir)
      .filter((file) => /\.(webp|png|jpg|jpeg|gif)$/i.test(file))
      .map((file) => `common/imgs/background/default/${file}`)
  } catch (err) {
    logger.warn('[归龙潮插件] 读取背景图片失败，使用默认背景。', err)
    return []
  }
}

function pickRandomBackground(backgroundList) {
  if (!Array.isArray(backgroundList) || !backgroundList.length) {
    return 'common/imgs/background/default/background.jpg'
  }

  const index = Math.floor(Math.random() * backgroundList.length)
  return backgroundList[index] || 'common/imgs/background/default/background.jpg'
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))

  if (totalSeconds === 0) {
    return '已结束'
  }

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []

  if (days > 0) {
    parts.push(`${days}天`)
  }

  if (days > 0 || hours > 0) {
    parts.push(`${hours}小时`)
  }

  if (days > 0 || hours > 0 || minutes > 0) {
    parts.push(`${minutes}分`)
  }

  if (days === 0 && hours === 0) {
    parts.push(`${seconds}秒`)
  }

  return parts.join('')
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

function pickRandomFile(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return ''
  }

  const index = Math.floor(Math.random() * files.length)
  return files[index] || ''
}

function getFolderImagePath(characterName) {
  if (!characterName || !fs.existsSync(gachaCharacterDetailDir)) {
    return ''
  }

  try {
    const characterDir = path.join(gachaCharacterDetailDir, characterName)
    if (!fs.existsSync(characterDir)) {
      return ''
    }

    const files = fs
      .readdirSync(characterDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((file) => supportedImageExtSet.has(path.extname(file).toLowerCase()))

    const picked = pickRandomFile(files)
    return picked ? `gacha/imgs/character-detail/${characterName}/${picked}` : ''
  } catch (err) {
    logger.warn('[归龙潮插件] 读取角色详情图片目录失败:', err)
    return ''
  }
}

function getLegacyImagePath(characterName) {
  if (!characterName || !fs.existsSync(gachaCharacterDetailDir)) {
    return ''
  }

  try {
    const files = fs
      .readdirSync(gachaCharacterDetailDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)

    const matched = files.find((file) => {
      const parsed = path.parse(file)
      return parsed.name === characterName && supportedImageExtSet.has(parsed.ext.toLowerCase())
    })

    return matched ? `gacha/imgs/character-detail/${matched}` : ''
  } catch (err) {
    logger.warn('[归龙潮插件] 读取角色详情图片目录失败:', err)
    return ''
  }
}

function findCharacterImage(characterName) {
  return getFolderImagePath(characterName) || getLegacyImagePath(characterName)
}

function normalizeGacha(gacha) {
  const startMs = Date.parse(gacha.start || '')
  const endMs = Date.parse(gacha.end || '')

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    return null
  }

  const characterName = normalizeCharacterName(gacha)
  const signature = typeof gacha?.signature === 'string' && gacha.signature.trim()
    ? gacha.signature.trim()
    : typeof gacha?.alias === 'string' && gacha.alias.trim()
      ? gacha.alias.trim()
      : characterName

  return {
    name: gacha.name || '未命名卡池',
    banner: gacha.banner || '限定招募',
    startMs,
    endMs,
    characterName,
    characterImage: findCharacterImage(characterName),
    signature,
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
  const backgroundList = getBackgroundImageList()
  const bg = pickRandomBackground(backgroundList)

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
      endCountdownText: '-',
      characterName: '',
      characterImage: '',
      bg,
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
    startShort: formatShortDate(selected.gacha.startMs),
    endShort: formatShortDate(selected.gacha.endMs),
    endCountdownText: formatCountdown(selected.gacha.endMs - now),
    characterName: selected.gacha.characterName,
    characterImage: selected.gacha.characterImage,
    signature: selected.gacha.signature,
    bg,
  }
}