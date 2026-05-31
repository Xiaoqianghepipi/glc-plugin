import fs from 'fs'
import path from 'path'
import { pluginVersion } from './config.js'
import { getCurrentYunzaiRuntimeInfo } from './yunzai-runtime.js'

const roleHeadDir = path.join(process.cwd(), 'plugins', 'glc-plugin', 'resources', 'help', 'imgs', 'role_head')
const backgroundDir = path.join(process.cwd(), 'plugins', 'glc-plugin', 'resources', 'common', 'imgs', 'background', 'default')

function getRoleHeadList() {
  try {
    if (!fs.existsSync(roleHeadDir)) {
      return []
    }

    return fs.readdirSync(roleHeadDir)
      .filter((file) => /\.(webp|png|jpg|jpeg|gif)$/i.test(file))
      .map((file) => `role_head/${file}`)
  } catch (err) {
    logger.warn('[归龙潮插件] 读取帮助页角色头像失败，使用空头像列表。', err)
    return []
  }
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

function pickRandomAvatar(avatarList) {
  if (!Array.isArray(avatarList) || !avatarList.length) {
    return ''
  }

  const index = Math.floor(Math.random() * avatarList.length)
  return avatarList[index] || ''
}

function pickRandomBackground(backgroundList) {
  if (!Array.isArray(backgroundList) || !backgroundList.length) {
    return 'common/imgs/background/default/background.jpg'
  }

  const index = Math.floor(Math.random() * backgroundList.length)
  return backgroundList[index] || 'common/imgs/background/default/background.jpg'
}

export function buildHelpData() {
  const yunzaiRuntimeInfo = getCurrentYunzaiRuntimeInfo()
  const avatarList = getRoleHeadList()
  const backgroundList = getBackgroundImageList()

  const attachAvatar = (item) => ({
    ...item,
    avatar: pickRandomAvatar(avatarList),
  })

  return {
    tplFile: './plugins/glc-plugin/resources/help/index.html',
    saveId: 'index',
    title: '归龙潮插件帮助',
    helpCfg: {
      title: '归龙潮帮助',
      subTitle: `${yunzaiRuntimeInfo} & glc-plugin ${pluginVersion}`,
    },
    helpGroup: [
      {
        group: '基础功能',
        list: [
          attachAvatar({ title: '&帮助', desc: '查看帮助菜单' }),
          attachAvatar({ title: '&卡池', desc: '查看当前卡池' }),
          attachAvatar({ title: '&扫墓', desc: '给牢归上香' }),
          attachAvatar({ title: '&[角色名]攻略', desc: '发送对应角色攻略图，例如 &导演攻略' }),
        ]
      },
      {
        group: '管理功能，仅管理可用',
        list: [
          attachAvatar({ title: '&更新', desc: '更新glc-plugin插件' }),
          attachAvatar({ title: '&强制更新', desc: '强制更新glc-plugin插件' }),
          attachAvatar({ title: '&拉取最新卡池', desc: '从云端拉取最新卡池信息' }),
          attachAvatar({ title: '&设置渲染精度100', desc: '设置图片渲染精度，范围 50~200' }),
          attachAvatar({ title: '&查看渲染精度', desc: '查看当前图片渲染精度' }),
        ]
      }
    ],
    colCount: 2,
    bg: pickRandomBackground(backgroundList),
  }
}
