export class ConnectionManager {
  private pool: Map<string, RTCPeerConnection>
  // eslint-disable-next-line no-undef
  constructor (private config: RTCConfiguration = {
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302'] },
      { urls: ['stun:stun1.l.google.com:19302'] },
      { urls: ['stun:stun2.l.google.com:19302'] },
      { urls: ['stun:stun3.l.google.com:19302'] },
      { urls: ['stun:stun4.l.google.com:19302'] }
    ]
  }) {
    this.pool = new Map()
  }

  newConnection (id: string): RTCPeerConnection {
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
    const connection = this.getConnection(id)
    connection.close()
    this.pool.set(id, undefined)
  }
}
