import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      mainFields: ['browser', 'module', 'main']
    }),
    commonjs({
      transformMixedEsModules: true,
      requireReturnsDefault: true,
      include: [
        /node_modules/,
        /@aws-sdk\/client-secrets-manager/
      ]
    }),
    react()
  ],
  base: '/',
  publicDir: path.resolve(__dirname, 'public'),
  define: {
    'process.env': process.env,
    global: 'globalThis'
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser'
    },
    dedupe: ['@aws-sdk/client-secrets-manager'],
    preserveSymlinks: true,
    mainFields: ['browser', 'module', 'main'],
    fallback: {
      path: 'path-browserify',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util/',
      url: false,
      http: false,
      https: false,
      zlib: false,
      assert: false,
      net: false,
      tls: false,
      child_process: false,
      fs: false,
      os: false
    }
  },
  optimizeDeps: {
    force: true,
    include: ['@aws-sdk/client-secrets-manager'],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
      supported: { 
        'top-level-await': true 
      },
      define: {
        global: 'globalThis'
      },
      platform: 'browser'
    }
  },
  build: {
    target: ['esnext', 'chrome89', 'edge89', 'firefox89', 'safari15'],
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  server: {
    port: 3000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    watch: {
      usePolling: true
    }
  },
  envDir: "src"
})
