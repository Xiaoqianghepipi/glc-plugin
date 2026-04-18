import fs from 'fs'
import path from 'path'

let cachedYunzaiRuntimeInfo = null

function getYunzaiTypeByPackageName(name) {
  const pkgName = String(name || '').toLowerCase()

  if (!pkgName) return 'Yunzai'
  if (pkgName.includes('trss')) return 'TRSS-Yunzai'
  if (pkgName.includes('miao')) return 'Miao-Yunzai'
  if (pkgName.includes('yunzai')) return 'Yunzai-Bot'

  return String(name || 'Yunzai')
}

export function getCurrentYunzaiRuntimeInfo() {
  if (cachedYunzaiRuntimeInfo) {
    return cachedYunzaiRuntimeInfo
  }

  try {
    const runtimePkgPath = path.join(process.cwd(), 'package.json')

    if (!fs.existsSync(runtimePkgPath)) {
      cachedYunzaiRuntimeInfo = 'Yunzai'
      return cachedYunzaiRuntimeInfo
    }

    const pkg = JSON.parse(fs.readFileSync(runtimePkgPath, 'utf8'))
    const type = getYunzaiTypeByPackageName(pkg?.name)
    const version = String(pkg?.version || '').trim()

    cachedYunzaiRuntimeInfo = version ? `${type} v${version}` : type
    return cachedYunzaiRuntimeInfo
  } catch (err) {
    logger.warn('[归龙潮插件] 获取 Yunzai 运行时信息失败，使用默认名称。', err)
    cachedYunzaiRuntimeInfo = 'Yunzai'
    return cachedYunzaiRuntimeInfo
  }
}
