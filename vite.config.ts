import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read version from version.conf at build time
function getVersion(): string {
  try {
    const versionPath = resolve(__dirname, 'version.conf')
    const versionFile = readFileSync(versionPath, 'utf-8')
    const match = versionFile.match(/APP_VERSION\s*=\s*["']v?(.*?)["']/)
    return match ? match[1] : 'unknown'
  } catch (error) {
    console.error('Error reading version from version.conf:', error)
    return 'unknown'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(getVersion()),
  },
})
