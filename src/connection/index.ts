import EventEmitter from 'events'
import { Server, Socket } from 'socket.io'
import { RTCPeerConnection } from 'wrtc'

export class ConnectionManager extends EventEmitter {
  private pool: Map<string, RTCPeerConnection>
  // eslint-disable-next-line no-undef
  constructor (private io: Server, private config: RTCConfiguration = {
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302'] }
    ]
  }) {
    super()
    this.pool = new Map()
    this.setup()
  }

  async connect (id: string) {
    const socket = this.io.to(id)
    console.log('attempting to connect to ', id)
    const connection = this.getConnection(id)
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', id, event.candidate)
      }
    }

    // emit the shortDescriptionInit to client
    const SDI = await connection.createOffer()
    await connection.setLocalDescription(SDI)
    socket.emit('offer', id, connection.localDescription)
  }

  private setup () {
    this.io.on('connection', (socket: Socket) => {
      socket.on('new-audience', async (id) => {
        // skip if connection already exists
        if (this.hasConnection(id)) return
        console.log('new audience coming in', id)
        // emit event, relay on user to call connect to establish the connection
        // after finishing the setup.
        this.emit('new-audience', socket.id)
        console.log(socket.id)
      })

      socket.on('answer', (id, description) => {
        console.log('received answer from ', id)
        this.getConnection(id).setRemoteDescription(description)
      })

      socket.on('candidate', (id, candidate) => {
        this.getConnection(id).addIceCandidate(
          new RTCIceCandidate(candidate)
        )
      })

      socket.on('disconnect', () => {
        console.log('disconnecting ', socket.id)
        this.closeConnection(socket.id)
      })
    })
  }

  hasConnection (id: string): boolean {
    return this.pool.has(id)
  }

  newConnection (id: string): RTCPeerConnection {
    const existingConnection = this.pool.get(id)
    if (existingConnection) {
      console.log('existing connection for ', id)
      return existingConnection
    }
    const connection = new RTCPeerConnection(this.config)
    this.pool.set(id, connection)
    return connection
  }

  getConnection (id: string): RTCPeerConnection {
    const connection = this.pool.get(id)
    if (!connection) {
      throw new Error(`No connection with id: ${id}`)
    }
    return connection
  }

  closeConnection (id: string): void {
    const connection = this.pool.get(id)
    if (connection)connection.close()
    this.pool.set(id, undefined)
  }
}
