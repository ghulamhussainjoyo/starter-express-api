import { Server } from 'socket.io'
export abstract class CommonSocketConfig {

    name: string
    io: Server

    constructor(name: string, io: Server) {
        this.io = io;
        this.name = name;
    }

    getName() {
        return this.name;
    }
    abstract configureSocket(): Server
}