import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import MediaModule from './media'
import { ConnectionManager } from './connection'
import { ControlManager } from './control'

const app = express()

const httpServer = http.createServer(app)

const port = parseInt(process.env.PORT, 10) || 3000

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
const mediaModule = new MediaModule()
mediaModule.start()

const connectionManager = new ConnectionManager(io)
const controlManager = new ControlManager()
const stream = mediaModule.output()
connectionManager.on('new-audience', async (id: string) => {
  const connection = connectionManager.newConnection(id)

  // stream the media to peer.
  stream.getTracks().forEach(track => connection.addTrack(track, stream))

  const dc = connection.createDataChannel('control')
  controlManager.addCandidate(id, dc)

  connectionManager.connect(id)
})

httpServer.listen(port, '0.0.0.0', () => console.log(`Server is running on port: ${port}`))
