import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import * as robot from 'robotjs'
import MediaModule from './media'
import { ConnectionManager } from './connection'

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
connectionManager.on('new-audience', async (id: string) => {
  const connection = connectionManager.newConnection(id)

  const stream = mediaModule.output()

  // stream the media to peer.
  stream.getTracks().forEach(track => connection.addTrack(track, stream))

  const dc = connection.createDataChannel('control')
  const { height, width } = robot.getScreenSize()
  dc.addEventListener('message', ({ data }) => {
    const { type, payload } = JSON.parse(data)
    if (type === 'mouse-move') {
      // console.log('moving mouse', payload)
      // console.log('calculated', payload.x * width, payload.y * height)
      robot.moveMouse(payload.y * height, payload.x * width)
    }
  })
  connectionManager.connect(id)
})

httpServer.listen(port, '0.0.0.0', () => console.log(`Server is running on port: ${port}`))
