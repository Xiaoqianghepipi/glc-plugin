export function buildMemorialData(elapsed) {
  return {
    tplFile: './plugins/glc-plugin/resources/memorial/index.html',
    saveId: 'memorial',
    title: '归龙潮扫墓',
    ...elapsed,
  }
}
