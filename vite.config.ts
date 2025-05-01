import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'DaisyPlayerReact',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          'react/jsx-runtime': 'jsxRuntime'
        },
        assetFileNames: 'assets/[name][extname]'
      }
    },
    cssCodeSplit: false
  }
})
