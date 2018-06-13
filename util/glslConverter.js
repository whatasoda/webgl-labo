const fse = require('fs-extra')
const srcDir = 'glsl'
const distDir = 'js/glsl'
const fileNameList = fse.readdirSync(srcDir).filter((fileName) => {
  return /\.(?:vert|frag)$/.test(fileName)
})
const succeeded = []
for (const fileName of fileNameList) {
  try {
    const contents = []
    let name = fileName.slice(0,-5)
    let ext = fileName.slice(-4)
    contents.push(
      ';((WGLL) => {',
      `WGLL.${name} = WGLL.${name} || {}`,
      `WGLL.${name}.${ext} = \``,
      fse.readFileSync(`${srcDir}/${fileName}`, 'utf8'),
      `\``,
      '})(window.WGLL = window.WGLL || {})'
    )
    fse.writeFileSync(`${distDir}/${fileName}.js`,contents.join('\n'))
    succeeded.push(fileName)
  } catch (e) {
    console.log(e)
    continue
  }
}
if (succeeded.length)
  console.log(`${new Date()}: ${succeeded.join(', ')}`);
