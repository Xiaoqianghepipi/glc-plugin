import { execFile } from 'child_process'
import { promisify } from 'util'
import { pluginRoot } from './config.js'

const execFileAsync = promisify(execFile)

export async function updatePlugin() {
  try {
    const { stdout, stderr } = await execFileAsync('git', ['-C', pluginRoot, 'pull', '--ff-only'])
    const output = `${stdout || ''}${stderr || ''}`.trim()
    const alreadyLatest = /already up to date|already up-to-date|已经是最新|无需更新/i.test(output)

    return {
      ok: true,
      updated: !alreadyLatest,
      output: output || '更新完成',
    }
  } catch (error) {
    const stdout = error?.stdout || ''
    const stderr = error?.stderr || ''
    const output = `${stdout}${stderr}`.trim() || error?.message || '更新失败'

    return {
      ok: false,
      updated: false,
      output,
    }
  }
}