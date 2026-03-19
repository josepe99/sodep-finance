const fs = require('node:fs')
const http = require('node:http')
const https = require('node:https')
const path = require('node:path')
const { URL } = require('node:url')

const DIST_DIR = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT || 8080)
const TRANSACTIONS_HOST = process.env.TRANSACTIONS_HOST || ''
const ANALYTICS_HOST = process.env.ANALYTICS_HOST || process.env.VITE_ANALYTICS_HOST || ''
const BANK_HOST = process.env.BANK_HOST || process.env.VITE_BANK_HOST || ''
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

function normalizeUrl(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function sendJsonError(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ message }))
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end(message)
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []

    request.on('data', (chunk) => {
      chunks.push(chunk)
    })

    request.on('end', () => {
      resolve(chunks.length > 0 ? Buffer.concat(chunks) : null)
    })

    request.on('error', reject)
  })
}

function resolveApiTarget(pathname) {
  if (pathname.startsWith('/api/transactions')) {
    return {
      host: TRANSACTIONS_HOST,
      errorMessage: 'TRANSACTIONS_HOST no está configurado en el frontend.',
      upstreamErrorMessage: 'No se pudo conectar con el servicio de transacciones.',
    }
  }

  if (pathname === '/api/balance') {
    return {
      host: ANALYTICS_HOST,
      errorMessage: 'ANALYTICS_HOST no está configurado en el frontend.',
      upstreamErrorMessage: 'No se pudo conectar con el servicio de analytics.',
    }
  }

  if (
    pathname === '/api/common/centros-servicios' ||
    pathname === '/api/secure/common/parametros'
  ) {
    return {
      host: BANK_HOST,
      errorMessage: 'BANK_HOST no está configurado en el frontend.',
      upstreamErrorMessage: 'No se pudo conectar con el servicio de bank.',
    }
  }

  return null
}

async function proxyApiRequest(request, response, requestUrl) {
  const target = resolveApiTarget(requestUrl.pathname)

  if (!target) {
    sendJsonError(response, 404, 'No existe un proxy configurado para este endpoint.')
    return
  }

  if (!target.host) {
    sendJsonError(response, 500, target.errorMessage)
    return
  }

  const upstreamUrl = new URL(`${normalizeUrl(target.host)}${requestUrl.pathname}${requestUrl.search}`)
  const body = await readRequestBody(request)
  const client = upstreamUrl.protocol === 'https:' ? https : http

  const headers = { ...request.headers }
  headers.host = upstreamUrl.host

  const proxyRequest = client.request(
    upstreamUrl,
    {
      method: request.method,
      headers,
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers)
      proxyResponse.pipe(response)
    },
  )

  proxyRequest.on('error', () => {
    sendJsonError(response, 502, target.upstreamErrorMessage)
  })

  if (body) {
    proxyRequest.write(body)
  }

  proxyRequest.end()
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
    proxyApiRequest(request, response, requestUrl).catch(() => {
      sendJsonError(response, 502, 'Ocurrió un error al reenviar la solicitud al backend.')
    })
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
