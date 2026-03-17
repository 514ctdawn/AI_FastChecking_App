import sharp from 'sharp'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const sourcePath = join(publicDir, 'icon-source.png')

if (!existsSync(sourcePath)) {
  console.error('icon-source.png not found in public folder')
  process.exit(1)
}

const source = readFileSync(sourcePath)
await Promise.all([
  sharp(source).resize(32, 32).png().toFile(join(publicDir, 'favicon-32.png')),
  sharp(source).resize(192, 192).png().toFile(join(publicDir, 'icon-192.png')),
  sharp(source).resize(512, 512).png().toFile(join(publicDir, 'icon-512.png')),
  sharp(source).resize(180, 180).png().toFile(join(publicDir, 'apple-touch-icon.png')),
])
console.log('Generated favicon-32.png, icon-192.png, icon-512.png, apple-touch-icon.png')
