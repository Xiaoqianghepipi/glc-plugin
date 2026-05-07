import fs from 'fs'
import path from 'path'
import plugin from '../../../lib/plugins/plugin.js'
import { resourceRoot } from '../lib/config.js'
import { findExistingFile } from '../lib/resource.js'

const guideImageRoot = path.join(resourceRoot, 'guide', 'imgs')
const supportedImageExtSet = new Set(['.jpg', '.png', '.jpeg', '.webp', '.gif'])

function collectImageFiles(dirPath) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    return []
  }

  const results = []
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      results.push(...collectImageFiles(entryPath))
      continue
    }

    if (entry.isFile() && supportedImageExtSet.has(path.extname(entry.name).toLowerCase())) {
      results.push(entryPath)
    }
  }

  return results.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

function getGuideImageFiles(name) {
  const targetDir = path.join(guideImageRoot, name)
  const imageFiles = collectImageFiles(targetDir)

  if (imageFiles.length) {
    return imageFiles
  }

  const legacyImage = findExistingFile(`${resourceRoot}/guide`, name, ['.jpg', '.png', '.jpeg', '.webp', '.gif'])
  return legacyImage ? [legacyImage] : []
}

function buildForwardGuideMessage(e, name, imageFiles) {
  const title = `${name}角色攻略`
  const subtitle = `点击查看${name}角色攻略`
  const botUin = Number(e?.self_id || e?.bot?.uin || 10000)

  const nodes = [
    {
      user_id: botUin,
      nickname: title,
      message: subtitle,
    },
    ...imageFiles.map((imagePath) => ({
      user_id: botUin,
      nickname: title,
      message: segment.image(`file://${imagePath}`),
    })),
  ]

  return globalThis.Bot?.makeForwardMsg ? globalThis.Bot.makeForwardMsg(nodes) : nodes
}

export class Guide extends plugin {
  constructor() {
    super({
      name: '归龙潮插件-攻略查询',
      dsc: '读取本地目录发送角色/导演攻略',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^[&＆](.+)攻略$',
          fnc: 'sendGuide'
        }
      ]
    })
  }

  async sendGuide(e) {
    try {
      const match = e.msg.match(/^[&＆](.+)攻略$/)
      if (!match || !match[1]) return false

      const name = match[1].trim()
      const imageFiles = getGuideImageFiles(name)

      if (imageFiles.length) {
        logger.info(`[归龙潮插件] 发送攻略合集: ${name}（${imageFiles.length} 张）`)
        await e.reply(buildForwardGuideMessage(e, name, imageFiles))
      } else {
        await e.reply(`未找到【${name}】的攻略图哦，请检查角色名字是否正确，或确认图片已放到 resources/guide/imgs/${name}/ 下~`)
      }

      return true
    } catch (err) {
      logger.error(`[归龙潮插件] 攻略图发送失败:`, err)
      return false
    }
  }
}
