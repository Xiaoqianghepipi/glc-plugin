import path from 'path'

const rootPath = process.cwd()

export const pluginName = 'glc-plugin'
export const pluginVersion = '1.0.6'
export const pluginRoot = path.join(rootPath, 'plugins', pluginName)
export const resourceRoot = path.join(pluginRoot, 'resources')
export const resourceRootUrl = `./plugins/${pluginName}/resources/`
