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

export class Update extends plugin {
  constructor() {
    super({
      name: '归龙潮插件-更新',
      dsc: '更新归龙潮插件到最新版本',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^(&更新|#?归龙潮更新)$',
          fnc: 'update',
          permission: 'master'
        }
      ]
    })
  }

  async update(e) {
    try {
      logger.info('[归龙潮插件] 开始执行更新...')

      const result = await updatePlugin()

      if (result.ok) {
        if (result.updated) {
          const sent = await restartByStdinCommand()
          if (sent) {
            await e.reply(`插件已更新完成，已通过标准输入发送 #重启。\n${result.output}`)
          } else {
            await e.reply(`插件已更新完成，但未找到 stdin 适配器，请手动发送 #重启。\n${result.output}`)
          }
        } else {
          await e.reply(`插件已经是最新版本。\n${result.output}`)
        }
      } else {
        await e.reply(`插件更新失败：${result.output}`)
      }

      return true
    } catch (err) {
      logger.error('[归龙潮插件] 插件更新异常:', err)
      await e.reply(`插件更新异常：${err.message}`)
      return false
    }
  }
}