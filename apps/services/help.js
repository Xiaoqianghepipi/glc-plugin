import puppeteer from '../../lib/puppeteer/puppeteer.js'
import { pluginName, resourceRootUrl } from '../config.js'

function buildHelpData() {
  return {
    tplFile: `./plugins/${pluginName}/resources/help/index.html`,
    _res_path: resourceRootUrl,
    title: '归龙潮插件帮助',
    helpCfg: {
      title: '归龙潮向导',
      subTitle: 'Guilongchao-Plugin v1.0'
    },
    helpGroup: [
      {
        group: '🎬 基础查询',
        list: [
          { title: '&[角色名]攻略', desc: '获取对应角色的攻略图 (如:&导演攻略)' },
          { title: '&帮助', desc: '查看本帮助菜单' }
        ]
      },
      {
        group: '⚙️ 管理设置 (画大饼)',
        list: [
          { title: '#归龙潮更新', desc: '更新插件' },
          { title: '#归龙潮设置', desc: '打开可视化面板' }
        ]
      }
    ],
    colCount: 2,
    bg: 'background.jpg'
  }
}

export async function sendHelp(e) {
  try {
    logger.info('[归龙潮插件] 正在动态生成帮助图...')

    const img = await puppeteer.render('help/index', buildHelpData(), {
      e,
      scale: 1.2,
      retType: 'base64'
    })

    if (img) {
      await e.reply(img)
    } else {
      await e.reply('帮助图生成失败，可能是模板错误或 Puppeteer 异常，请查看控制台日志。')
    }

    return true
  } catch (err) {
    logger.error('[归龙潮插件] 帮助图渲染异常:', err)
    await e.reply(`渲染异常: ${err.message}`)
    return false
  }
}
