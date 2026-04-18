import plugin from '../../../lib/plugins/plugin.js'
import { updatePlugin } from '../lib/update.js'

async function restartByStdinCommand() {
  try {
    const adapters = globalThis.Bot?.adapter
    if (!Array.isArray(adapters)) return false

    const stdinAdapter = adapters.find(i => i?.id === 'stdin' && typeof i?.message === 'function')
    if (!stdinAdapter) return false
    
    await stdinAdapter.message('#重启')
    return true
  } catch (err) {
    logger.warn('[归龙潮插件] 通过标准输入发送 #重启 失败。', err)
    return false
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function buildForwardMessage(e, title, content) {
  const text = String(content || '').trim() || '无输出'
  const lines = text.split(/\r?\n/)
  const chunkSize = 8
  const nodes = []
  const botUin = Number(e?.self_id || e?.bot?.uin || 10000)

  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize).join('\n').trim()
    if (!chunk) continue

    nodes.push({
      user_id: botUin,
      nickname: title,
      message: chunk,
    })
  }

  if (!nodes.length) {
    nodes.push({
      user_id: botUin,
      nickname: title,
      message: text,
    })
  }

  return globalThis.Bot?.makeForwardMsg ? globalThis.Bot.makeForwardMsg(nodes) : text
}

export class Update extends plugin {
  constructor() {
    super({
      name: '归龙潮插件-更新',
      dsc: '更新归龙潮插件到最新版本',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^&更新$',
          fnc: 'update',
          permission: 'master'
        }
      ]
    })
  }

  async update(e) {
    try {
      await e.reply(`归龙潮插件正在更新......`)
      logger.info('[归龙潮插件] 开始执行更新...')

      const result = await updatePlugin()
      const forwardMsg = buildForwardMessage(e, '归龙潮插件更新日志', result.output)

      if (result.ok) {
        if (result.updated) {
          await e.reply('插件已更新完成，更新日志如下。即将自动重启。')
          await e.reply(forwardMsg)

          await sleep(2000)
          const sent = await restartByStdinCommand()
          if (!sent) {
            await e.reply(`插件已更新完成，但未找到 stdin 适配器，请手动发送 #重启。`)
          }
          logger.info('[归龙潮插件] 更新成功。')
        } else {
          await e.reply('插件已经是最新版本。')
          await e.reply(forwardMsg)
          logger.info('[归龙潮插件] 插件已是最新版本。')
        }
      } else {
        await e.reply('插件更新失败，详情见聊天记录。')
        await e.reply(forwardMsg)
        logger.error('[归龙潮插件] 更新失败。')
      }

      return true
    } catch (err) {
      logger.error('[归龙潮插件] 插件更新异常:', err)
      await e.reply(`插件更新异常：${err.message}`)
      return false
    }
  }
}