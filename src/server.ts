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
connectionManager.on('new-audience', async (id: string) => {
  const connection = connectionManager.newConnection(id)
  const stream = mediaModule.output()
  // stream the media to peer.
  stream.getTracks().forEach(track => connection.addTrack(track, stream))

  const dc = connection.createDataChannel('control')
  controlManager.addCandidate(id, dc)

  await connectionManager.connect(id)
})
connectionManager.on('disconnect', async (id: string) => {
  controlManager.removeCandidate(id)
})

httpServer.listen(port, '0.0.0.0', () => console.log(`Server is running on port: ${port}`))
