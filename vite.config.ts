import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { atlasPlugin } from './build/atlasPlugin.ts'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/to-space/' : '/',
  plugins: [react(), atlasPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}))
