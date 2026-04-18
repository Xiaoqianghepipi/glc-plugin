export function buildRipData(elapsed) {
  return {
    tplFile: './plugins/glc-plugin/resources/rip/index.html',
    saveId: 'rip',
    title: '归龙潮扫墓',
    ...elapsed,
  }
}