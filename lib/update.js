import { execFile } from 'child_process'
import { promisify } from 'util'
import { pluginRoot } from './config.js'

const execFileAsync = promisify(execFile)

async function runGit(args) {
  return execFileAsync('git', ['-C', pluginRoot, ...args])
}

async function safeGetHead() {
  try {
    const { stdout } = await runGit(['rev-parse', 'HEAD'])
    return String(stdout || '').trim()
  } catch {
    return ''
  }
}

async function resolveUpstreamRef() {
  try {
    const { stdout } = await runGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])
    const upstream = String(stdout || '').trim()
    if (upstream) return upstream
  } catch {
    // 忽略异常，继续使用 origin 分支兜底检测。
  }

  try {
    const { stdout } = await runGit(['rev-parse', '--abbrev-ref', 'HEAD'])
    const currentBranch = String(stdout || '').trim()
    const candidates = [
      currentBranch ? `origin/${currentBranch}` : '',
      'origin/master',
      'origin/main',
    ].filter(Boolean)

    for (const ref of candidates) {
      try {
        await runGit(['rev-parse', '--verify', '--quiet', ref])
        return ref
      } catch {
        // 当前候选无效，继续尝试下一个。
      }
    }
  } catch {
    // 忽略异常，交由下方统一抛错。
  }

  throw new Error('未找到可用远端分支，请检查 git upstream 配置。')
}

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
    const { stdout, stderr } = await runGit(['pull', '--ff-only'])
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

export async function forceUpdatePlugin() {
  const beforeHead = await safeGetHead()

  try {
    const logs = []

    const fetchResult = await runGit(['fetch', '--all', '--prune'])
    logs.push(`${fetchResult.stdout || ''}${fetchResult.stderr || ''}`.trim())

    const upstreamRef = await resolveUpstreamRef()
    const resetResult = await runGit(['reset', '--hard', upstreamRef])
    logs.push(`重置到 ${upstreamRef}`)
    logs.push(`${resetResult.stdout || ''}${resetResult.stderr || ''}`.trim())

    const afterHead = await safeGetHead()
    const updated = Boolean(beforeHead && afterHead && beforeHead !== afterHead)
    const recentCommits = await getRecentCommitTitles(5)

    return {
      ok: true,
      updated,
      output: logs.filter(Boolean).join('\n').trim() || '强制更新完成',
      recentCommits,
      forced: true,
    }
  } catch (error) {
    const stdout = error?.stdout || ''
    const stderr = error?.stderr || ''
    const output = `${stdout}${stderr}`.trim() || error?.message || '强制更新失败'
    const recentCommits = await getRecentCommitTitles(5)

    return {
      ok: false,
      updated: false,
      output,
      recentCommits,
      forced: true,
    }
  }
}