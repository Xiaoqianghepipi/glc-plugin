import plugin from '../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'
import { segment } from 'oicq'
// 引入 Yunzai 自带的 puppeteer 渲染库
import puppeteer from '../../lib/puppeteer/puppeteer.js'

const _path = process.cwd()
const pluginName = 'guilongchao-plugin'
const resPath = path.join(_path, 'plugins', pluginName, 'resources')

export class Guilongchao extends plugin {
  constructor() {
    super({
      name: '归龙潮插件',
      dsc: '读取本地目录发送攻略及动态渲染帮助图',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^&(.+)攻略$',
          fnc: 'sendGuide'
        },
        {
          reg: '^(&帮助|#?归龙潮帮助)$',
          fnc: 'sendHelp'
        }
      ]
    })
  }

  /**
   * 发送角色/导演攻略图 (保持原样，读取本地静态图片)
   */
  async sendGuide(e) {
    try {
      const match = e.msg.match(/^&(.+)攻略$/)
      if (!match || !match[1]) return false
      
      const name = match[1].trim()
      const exts = ['.jpg', '.png', '.jpeg', '.webp']
      let imgPath = null

      for (const ext of exts) {
        const tempPath = path.join(resPath, 'guide', `${name}${ext}`)
        if (fs.existsSync(tempPath)) {
          imgPath = tempPath
          break
        }
      }

      if (imgPath) {
        logger.info(`[归龙潮插件] 发送攻略图: ${name}`)
        await e.reply(segment.image(`file://${imgPath}`))
      } else {
        await e.reply(`未找到【${name}】的攻略图哦，请检查 guide 目录~`)
      }
      return true
    } catch (err) {
      logger.error(`[归龙潮插件] 攻略图发送失败:`, err)
      return false
    }
  }

  /**
   * 动态生成并发送帮助图
   */
  async sendHelp(e) {
    try {
      logger.info(`[归龙潮插件] 正在动态生成帮助图...`)
      
      // 构造渲染数据，符合 SKILL.md 3.3 节的规范
      let helpData = {
        tplFile: `./plugins/${pluginName}/resources/help/index.html`, // 模板路径
        _res_path: `./plugins/${pluginName}/resources/`, // 静态资源基准路径
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
        colCount: 2, // 两列布局
        bg: 'background.jpg' // 背景图名称
      }

      // 调用 puppeteer 渲染模板 (第一个参数不需要加 .html)
      const img = await puppeteer.render('help/index', helpData, {
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
      logger.error(`[归龙潮插件] 帮助图渲染异常:`, err)
      await e.reply(`渲染异常: ${err.message}`)
      return false
    }
  }
}