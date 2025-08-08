const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('./lib/ws');

const port = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
    // To handle favicon.ico requests, you can add a condition here.
    // For this example, we'll focus on serving the main files.

    // Construct the file path
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    // Security: Prevent directory traversal
    const publicDir = path.join(__dirname, 'public');
    filePath = path.normalize(filePath);
    if (!filePath.startsWith(publicDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    let extname = String(path.extname(filePath)).toLowerCase();
    let contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                // If the file is not found, it might be a request for a page that needs a 404 response.
                // For simplicity, we will assume any file not found is a 404.
                // A more robust solution would be to check if the request expects HTML.
                fs.readFile(path.join(__dirname, 'public', '404.html'), (error404, content404) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content404 || '404 Not Found', 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+err.code+' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  // For now, we'll accept all connections.
  // In a real application, you might want to check the request path or origin.
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data, isBinary) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'move') {
        console.log(`Player moved to (${message.x}, ${message.y})`);
      }
    } catch (e) {
      // Not a JSON message, assume it's a chat message.
      console.log(`Received chat message: ${data}`);
      // Broadcast the chat message to all other clients.
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data, { binary: isBinary });
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
