import { segment } from 'oicq'
import { resourceRoot } from '../config.js'
import { findExistingFile } from '../utils/resource.js'

export async function sendGuide(e) {
  try {
    const match = e.msg.match(/^&(.+)攻略$/)
    if (!match || !match[1]) return false

    const name = match[1].trim()
    const imagePath = findExistingFile(
      `${resourceRoot}/guide`,
      name,
      ['.jpg', '.png', '.jpeg', '.webp']
    )

    if (imagePath) {
      logger.info(`[归龙潮插件] 发送攻略图: ${name}`)
      await e.reply(segment.image(`file://${imagePath}`))
    } else {
      await e.reply(`未找到【${name}】的攻略图哦，请检查 guide 目录~`)
    }

    return true
  } catch (err) {
    logger.error(`[归龙潮插件] 攻略图发送失败:`, err)
    return false
  }
}
