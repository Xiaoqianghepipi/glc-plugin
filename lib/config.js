import path from 'path'
import { pathToFileURL } from 'url'

const rootPath = process.cwd()

export const pluginName = 'glc-plugin'
export const pluginVersion = '1.1.0'
export const pluginRoot = path.join(rootPath, 'plugins', pluginName)
export const resourceRoot = path.join(pluginRoot, 'resources')
export const resourceRootUrl = `${pathToFileURL(resourceRoot).href.replace(/\/$/, '')}/`
