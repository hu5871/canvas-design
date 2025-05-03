import { defineConfig } from 'rolldown'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  input: './index.ts',
  output: {
    format: 'es',
    name: 'Design',
    dir: path.resolve(__dirname, './dist'),
    sourcemap: true,
  },
})
