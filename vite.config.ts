import react from '@vitejs/plugin-react'
import { createReadStream, existsSync } from 'node:fs'
import { copyFile, mkdir } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const salesDataPath = resolve(projectRoot, 'Scripts', 'ventas.json')

function serveSalesData(
  request: IncomingMessage,
  response: ServerResponse,
  next: (error?: Error | null) => void,
) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    next()
    return
  }

  if (!existsSync(salesDataPath)) {
    response.statusCode = 404
    response.end('No se encontró Scripts/ventas.json')
    return
  }

  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-cache')
  if (request.method === 'HEAD') {
    response.end()
    return
  }

  createReadStream(salesDataPath)
    .on('error', next)
    .pipe(response)
}

function salesDataPlugin(): Plugin {
  return {
    name: 'serve-and-copy-sales-data',
    configureServer(server) {
      server.middlewares.use('/data/ventas.json', serveSalesData)
      server.middlewares.use(
        `${server.config.base}data/ventas.json`,
        serveSalesData,
      )
    },
    async writeBundle(options) {
      if (!existsSync(salesDataPath)) {
        throw new Error('No se encontró Scripts/ventas.json para incluirlo en dist.')
      }

      const outputDirectory = resolve(projectRoot, options.dir ?? 'dist')
      const outputPath = resolve(outputDirectory, 'data', 'ventas.json')
      await mkdir(dirname(outputPath), { recursive: true })
      await copyFile(salesDataPath, outputPath)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/Proyecto-3-DAWM/',
  plugins: [react(), salesDataPlugin()],
})
