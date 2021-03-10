import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
import MediaModule from './media'
import { ConnectionManager } from './connection'

const app = express()

const httpServer = http.createServer(app)

const port = process.env.PORT || 3000

const io = new Server(httpServer)

const connectionManager = new ConnectionManager()

const mediaModule = new MediaModule()

mediaModule.start()

io.on('connection', (socket: Socket) => {
  socket.on('new-audience', async (id) => {
    // TODO: when new audience join, stream video to it's peer.
    const audienceConnection = connectionManager.newConnection(id)
    const stream = mediaModule.output()

    // stream the media to peer.
    stream.getTracks().forEach(track => audienceConnection.addTrack(track, stream))

    audienceConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', id, event.candidate)
      }
    }

    // emit the shortDescriptionInit to client
    const SDI = await audienceConnection.createOffer()
    await audienceConnection.setLocalDescription(SDI)
    socket.emit('offer', id, audienceConnection.localDescription)
  })

  socket.on('answer', (id, description) => {
    connectionManager.getConnection(id).setRemoteDescription(description)
  })

  socket.on('candidate', (id, candidate) => {
    connectionManager.getConnection(id).addIceCandidate(
      new RTCIceCandidate(candidate)
    )
  })

  socket.on('disconnect', (id) => {
    connectionManager.closeConnection(id)
  })
})

httpServer.listen(port, () => console.log(`Server is running on port: ${port}`))
