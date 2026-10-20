// ========================================================
// CampusHub - Node.js HTTP Server
// Built-in http module for routing/static files, MongoDB for
// storage, cookie sessions for admin/user login.
// ========================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { connect, MONGODB_URI, MONGODB_DB } = require('./db');
const { handleApi } = require('./api');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Only these top-level paths may be served as static files
const PUBLIC_FOLDERS = ['css/', 'js/', 'images/'];

function serveStaticFile(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('405 Method Not Allowed');
  }

  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname === '/' ? 'index.html' : pathname);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Bad Request');
  }

  // Clean URL support: /events -> events.html
  if (!path.extname(relativePath) && fs.existsSync(path.join(PUBLIC_DIR, relativePath + '.html'))) {
    relativePath += '.html';
  }

  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access denied.');
  }

  // Serve only top-level .html pages and the public asset folders, so
  // server code, package files, node_modules and .env are never exposed.
  const relative = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
  const isTopLevelPage = !relative.includes('/') && relative.endsWith('.html');
  if (!isTopLevelPage && !PUBLIC_FOLDERS.some(folder => relative.startsWith(folder))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access to this file is denied.');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404 Not Found</h1><p>The requested file was not found on this server.</p>');
    }

    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') return res.end();

    const stream = fs.createReadStream(filePath);
    stream.on('error', streamError => {
      console.error('File stream error:', streamError);
      res.destroy();
    });
    stream.pipe(res);
  });
}

async function main() {
  console.log('====================================================');
  console.log(` Connecting to MongoDB: ${MONGODB_URI} (db: ${MONGODB_DB})`);
  const db = await connect();

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      return handleApi(req, res, url, db);
    }
    serveStaticFile(req, res, url.pathname);
  });

  server.listen(PORT, () => {
    console.log(` CampusHub Server is running on: http://localhost:${PORT}`);
    console.log('====================================================');
  });

  const shutdown = () => {
    server.close();
    db.client.close().finally(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  console.error('Failed to start CampusHub:', err.message);
  console.error('Is MongoDB running? Set MONGODB_URI if it is not on 127.0.0.1:27017.');
  process.exit(1);
});
