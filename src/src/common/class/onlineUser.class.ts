import { Socket } from 'socket.io'

interface IOnlineUsres {
    userId: string,
    socketId: string
}
class OnlineUsers {

    onlineUsers: { [key: string]: string } = {}
    addUser(data: IOnlineUsres) {
        (this.onlineUsers[data.userId] = data.socketId)
    }

    isUserOnline(userId: string): boolean {
        return this.onlineUsers[userId] !== undefined ? true : false
    }
    getSocketId(userId: string) {
        return this.onlineUsers[userId]
    }

    getOnlineUsers() {
        return this.onlineUsers
    }

    deleteOnlineUser(userId: string) {
        if (this.isUserOnline(userId)) {
            delete this.onlineUsers[userId]
        }
    }
}

export default new OnlineUsers()