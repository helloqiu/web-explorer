#!/usr/bin/env node
"use strict"

const path = require('path')
const express = require('express')
const contentDisposition = require('content-disposition')
const fs = require('fs')
const program = require('commander')
const pkg = require(path.join(__dirname, 'package.json'))
const scan = require('./scan')


program
  .version(pkg.version)
  .option('-p, --port <port>', 'Port on which to listen to (defaults to 3000', parseInt)
  .option('--host <host>', 'Host on which to listen to (default 127.0.0.1)')
  .parse(process.argv)

const port = program.port || 3000
const host = program.host || '127.0.0.1'

/* Scan the directory in which the script was called.
*  It will add the 'files/' prefix to all files and folders, so that
*  download links point to our /files route
*/
let tree = scan('.', 'files')

const options = {
  'recursive': true
}
fs.watch('.', options, (eventType, filename) => {
  tree = scan('.', 'files')
  console.log(`event type: ${eventType}`)
  if (filename) {
    console.log(`filename: ${filename}`)
  } else {
    console.log('filename not provided')
  }
})

// Create a new express app
let app = express()


// Serve static files from the frontend folder
app.use('/', express.static(path.join(__dirname, 'frontend')))


// Serve files from the current directory under the /files route
app.use('/files', express.static(process.cwd(), {
    index: false,
    setHeaders: function(res, path) {
        // Set header to force files to download
        res.setHeader('Content-Disposition', contentDisposition(path))
    }
}))


// This endpoint is requested by our frontend JS
app.get('/scan', function(req, res) {
    res.send(tree)
})

// Everything is setup. Listen on the port
app.listen(port, host)

console.log(`web explorer is running on ${host}:${port}`)
