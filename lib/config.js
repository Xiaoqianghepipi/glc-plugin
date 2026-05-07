import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'

const rootPath = process.cwd()

export const pluginName = 'glc-plugin'

function getPackageVersion() {
	try {
		const pkgPath = path.join(rootPath, 'package.json')
		const content = fs.readFileSync(pkgPath, 'utf8')
		const pkg = JSON.parse(content)
		return pkg.version || '0.0.0'
	} catch (e) {
		return '0.0.0'
	}
}

export const pluginVersion = getPackageVersion()
export const pluginRoot = path.join(rootPath, 'plugins', pluginName)
export const resourceRoot = path.join(pluginRoot, 'resources')
export const resourceRootUrl = `${pathToFileURL(resourceRoot).href.replace(/\/$/, '')}/`
