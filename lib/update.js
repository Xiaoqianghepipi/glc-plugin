import { execFile } from 'child_process'
import { promisify } from 'util'
import { pluginRoot } from './config.js'

const execFileAsync = promisify(execFile)

async function getRecentCommitTitles(limit = 5) {
  try {
    const { stdout } = await execFileAsync('git', [
      '-C',
      pluginRoot,
      'log',
      '--no-merges',
      `-n${limit}`,
      '--pretty=format:%h %s',
    ])

    return String(stdout || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  } catch (err) {
    logger.warn('[归龙潮插件] 获取最近 commits 失败。', err)
    return []
  }
}

export async function updatePlugin() {
  try {
    const { stdout, stderr } = await execFileAsync('git', ['-C', pluginRoot, 'pull', '--ff-only'])
    const output = `${stdout || ''}${stderr || ''}`.trim()
    const alreadyLatest = /already up to date|already up-to-date|已经是最新|无需更新/i.test(output)
    const recentCommits = await getRecentCommitTitles(5)

    return {
      ok: true,
      updated: !alreadyLatest,
      output: output || '更新完成',
      recentCommits,
    }
  } catch (error) {
    const stdout = error?.stdout || ''
    const stderr = error?.stderr || ''
    const output = `${stdout}${stderr}`.trim() || error?.message || '更新失败'
    const recentCommits = await getRecentCommitTitles(5)

    return {
      ok: false,
      updated: false,
      output,
      recentCommits,
    }
  }
}