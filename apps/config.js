import path from 'path'

const rootPath = process.cwd()

export const pluginName = 'guilongchao-plugin'
export const pluginRoot = path.join(rootPath, 'plugins', pluginName)
export const resourceRoot = path.join(pluginRoot, 'resources')
export const resourceRootUrl = `./plugins/${pluginName}/resources/`
