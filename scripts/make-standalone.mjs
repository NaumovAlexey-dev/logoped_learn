import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const jsTag = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
const cssTag = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)

if (!jsTag || !cssTag) {
  throw new Error('Could not find built JS/CSS tags in dist/index.html')
}

const readAsset = (url) => fs.readFileSync(path.join(dist, url.replace(/^\//, '')), 'utf8')
const js = readAsset(jsTag[1]).replace(/<\/script>/g, '<\\/script>')
const css = readAsset(cssTag[1])

let out = html
  .replace(jsTag[0], () => `<script type="module">\n${js}\n</script>`)
  .replace(cssTag[0], () => `<style>\n${css}\n</style>`)
  .replace(/<link rel="manifest"[^>]*>\s*/g, '')
  .replace(/<link rel="icon"[^>]*>\s*/g, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\s*/g, '')

fs.writeFileSync('priem-standalone.html', out)
console.log('priem-standalone.html:', (Buffer.byteLength(out) / 1024).toFixed(0), 'KB')
