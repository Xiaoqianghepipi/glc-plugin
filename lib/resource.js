import fs from 'fs'
import path from 'path'

export function findExistingFile(baseDir, fileName, extensions) {
  for (const extension of extensions) {
    const targetPath = path.join(baseDir, `${fileName}${extension}`)
    if (fs.existsSync(targetPath)) {
      return targetPath
    }
  }

  return null
}
