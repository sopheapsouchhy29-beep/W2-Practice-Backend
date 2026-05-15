// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    console.log(`Received ${method} request for ${url}`);

    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Welcome to the Home Page');
    }

    if (url === '/contact' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(`
          <html>
            <head><title>Contact</title></head>
            <body>
              <h1>Contact Us</h1>
              <form method="POST" action="/contact">
                <input type="text" name="name" placeholder="Your name" required />
                <button type="submit">Submit</button>
              </form>
            </body>
          </html>
        `);
    }

    if (url === '/contact' && method === 'POST') {
        // Handle form submission
        let body = '';

        // Listen for data chunks
        req.on('data', (chunk) => {
            body += chunk.toString();
            console.log('Data chunk received:', chunk.toString());
        });

        // When all data is received
        req.on('end', () => {
            console.log('Form data received:', body);

            // Parse the URL-encoded form data
            // Format: name=John (simple parsing for this exercise)
            const params = new URLSearchParams(body);
            const name = params.get('name');

            console.log('Parsed name:', name);

            // Validate name is not empty
            if (!name || name.trim() === '') {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end(`
                  <html>
                    <head><title>Error</title></head>
                    <body>
                      <h1>Error</h1>
                      <p>Name cannot be empty!</p>
                      <a href="/contact">Go back</a>
                    </body>
                  </html>
                `);
            }

            // Append name to submissions.txt
            const submissionLine = `${name} - ${new Date().toISOString()}\n`;
            const filePath = path.join(__dirname, 'submissions.txt');

            fs.appendFile(filePath, submissionLine, (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    return res.end(`
                      <html>
                        <head><title>Error</title></head>
                        <body>
                          <h1>Server Error</h1>
                          <p>Failed to save submission.</p>
                        </body>
                      </html>
                    `);
                }

                // Success response
                console.log('Successfully saved submission for:', name);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                return res.end(`
                  <html>
                    <head><title>Success</title></head>
                    <body>
                      <h1>Thank You!</h1>
                      <p>Your submission has been saved, ${name}!</p>
                      <a href="/contact">Submit another</a>
                    </body>
                  </html>
                `);
            });
        });

        // Handle errors
        req.on('error', (err) => {
            console.error('Request error:', err);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            return res.end('Bad Request');
        });

        return;
    }

    // 404 for undefined routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
