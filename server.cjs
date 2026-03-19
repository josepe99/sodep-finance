const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')

const DIST_DIR = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT || 8080)
let isShuttingDown = false

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
}

function sendFile(filePath, response) {
  const extension = path.extname(filePath)
  const contentType = MIME_TYPES[extension] || 'application/octet-stream'
  const fileName = path.basename(filePath)
  const shouldDisableCache = extension === '.html' || fileName === 'config.js'

  fs.readFile(filePath, (error, file) => {
    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Error interno al leer el archivo.')
      return
    }

    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': shouldDisableCache ? 'no-store, max-age=0' : 'public, max-age=31536000, immutable',
    })
    response.end(file)
  })
}

function resolvePath(urlPath) {
  const safePath = path.normalize(path.join(DIST_DIR, urlPath))
  if (!safePath.startsWith(DIST_DIR)) {
    return null
  }
  return safePath
}

function sendJsonError(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ message }))
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end(message)
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  const pathname = decodeURIComponent(requestUrl.pathname)

  if (pathname === '/healthz') {
    sendText(response, 200, 'ok')
    return
  }

  if (pathname === '/readyz') {
    sendText(response, isShuttingDown ? 503 : 200, isShuttingDown ? 'shutting-down' : 'ready')
    return
  }

  if (pathname.startsWith('/api/')) {
    sendJsonError(
      response,
      404,
      'El frontend no proxya /api en runtime. Configura VITE_API_URL para que React consuma Quarkus directamente.',
    )
    return
  }

  const requestedFile = pathname === '/' ? '/index.html' : pathname
  const resolvedPath = resolvePath(requestedFile)

  if (!resolvedPath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Acceso denegado.')
    return
  }

  fs.stat(resolvedPath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(resolvedPath, response)
      return
    }

    const indexPath = path.join(DIST_DIR, 'index.html')
    sendFile(indexPath, response)
  })
})

server.listen(PORT, () => {
  console.log(`Frontend escuchando en puerto ${PORT}`)
})

function shutdown(signal) {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  console.log(`Señal ${signal} recibida. Cerrando servidor HTTP...`)

  server.close((error) => {
    if (error) {
      console.error('Error al cerrar el servidor.', error)
      process.exit(1)
      return
    }

    process.exit(0)
  })

  setTimeout(() => {
    console.error('Timeout agotado al cerrar el servidor.')
    process.exit(1)
  }, 10000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
