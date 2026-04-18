import plugin from '../../../lib/plugins/plugin.js'
import { forceUpdatePlugin, updatePlugin } from '../lib/update.js'

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

function buildRecentCommitSection(recentCommits = []) {
  if (!Array.isArray(recentCommits) || !recentCommits.length) {
    return ''
  }

  const lines = recentCommits.map((item, index) => `${index + 1}. ${item}`)
  return `最近 commits：\n${lines.join('\n')}`
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
        },
        {
          reg: '^&强制更新$',
          fnc: 'forceUpdate',
          permission: 'master'
        }
      ]
    })
  }

  async executeUpdate(e, isForce = false) {
    try {
      if (isForce) {
        await e.reply('归龙潮插件正在强制更新......（将忽略常见拉取冲突并同步远端版本）')
        logger.info('[归龙潮插件] 开始执行强制更新...')
      } else {
        await e.reply('归龙潮插件正在更新......')
        logger.info('[归龙潮插件] 开始执行更新...')
      }

      const result = isForce ? await forceUpdatePlugin() : await updatePlugin()
      const commitSection = buildRecentCommitSection(result.recentCommits)
      const detail = [result.output, commitSection].filter(Boolean).join('\n\n')
      const title = isForce ? '归龙潮插件强制更新日志' : '归龙潮插件更新日志'
      const forwardMsg = buildForwardMessage(e, title, detail)

      if (result.ok) {
        if (result.updated) {
          await e.reply(isForce ? '插件强制更新完成，更新日志如下。即将自动重启。' : '插件已更新完成，更新日志如下。即将自动重启。')
          await e.reply(forwardMsg)

          await sleep(2000)
          const sent = await restartByStdinCommand()
          if (!sent) {
            await e.reply(`插件已更新完成，但未找到 stdin 适配器，请手动发送 #重启。`)
          }
          logger.info(isForce ? '[归龙潮插件] 强制更新成功。' : '[归龙潮插件] 更新成功。')
        } else {
          await e.reply(isForce ? '强制同步完成，当前已与远端一致。' : '插件已经是最新版本。')
          await e.reply(forwardMsg)
          logger.info(isForce ? '[归龙潮插件] 强制同步完成，无新增提交。' : '[归龙潮插件] 插件已是最新版本。')
        }
      } else {
        if (isForce) {
          await e.reply('插件强制更新失败，详情见聊天记录。')
        } else {
          await e.reply('插件更新失败，详情见聊天记录。可尝试使用 &强制更新。')
        }
        await e.reply(forwardMsg)
        logger.error(isForce ? '[归龙潮插件] 强制更新失败。' : '[归龙潮插件] 更新失败。')
      }

      return true
    } catch (err) {
      logger.error(isForce ? '[归龙潮插件] 插件强制更新异常:' : '[归龙潮插件] 插件更新异常:', err)
      await e.reply(isForce ? `插件强制更新异常：${err.message}` : `插件更新异常：${err.message}`)
      return false
    }
  }

  async update(e) {
    return this.executeUpdate(e, false)
  }

  async forceUpdate(e) {
    return this.executeUpdate(e, true)
  }
}