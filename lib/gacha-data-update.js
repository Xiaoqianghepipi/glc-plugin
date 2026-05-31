import fs from 'fs'
import path from 'path'
import http from 'http'
import https from 'https'
import { pluginRoot } from './config.js'

const gachaFile = path.join(pluginRoot, 'resources', 'gacha', 'gacha.json')
const maxRedirects = 5

function normalizeGithubUrl(rawUrl) {
  const url = String(rawUrl || '').trim()
  if (!url) return ''

  const githubBlob = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i)
  if (githubBlob) {
    const [, owner, repo, branch, filePath] = githubBlob
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
  }

  return url
}

function requestText(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > maxRedirects) {
      reject(new Error('重定向次数过多，请检查链接是否正确。'))
      return
    }

    const client = url.startsWith('https://') ? https : http
    const req = client.get(url, (res) => {
      const status = res.statusCode || 0

      if (status >= 300 && status < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, url).toString()
        res.resume()
        requestText(nextUrl, redirectCount + 1).then(resolve).catch(reject)
        return
      }

      if (status !== 200) {
        res.resume()
        reject(new Error(`拉取失败，HTTP 状态码: ${status}`))
        return
      }

      res.setEncoding('utf8')
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => resolve(data))
    })

    req.on('error', (err) => reject(err))
  })
}

function validateGachaData(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return '卡池数据不是有效的 JSON 对象。'
  }

  if (!Array.isArray(parsed.gachas)) {
    return '卡池数据缺少 gachas 数组。'
  }

  return ''
}

export async function updateGachaDataFromRemote(rawUrl) {
  const url = normalizeGithubUrl(rawUrl)
  if (!url) {
    return { ok: false, message: '云端卡池链接不能为空。' }
  }

  try {
    const text = await requestText(url)
    const parsed = JSON.parse(text)
    const validationError = validateGachaData(parsed)

    if (validationError) {
      return { ok: false, message: validationError }
    }

    const payload = `${JSON.stringify(parsed, null, 2)}\n`
    fs.writeFileSync(gachaFile, payload, 'utf8')

    return {
      ok: true,
      message: `卡池数据已更新，共 ${parsed.gachas.length} 条。`,
    }
  } catch (err) {
    return {
      ok: false,
      message: `拉取失败：${err.message}`,
    }
  }
}
