import { CommonSocketConfig } from "./common.socket.config";
import { Server } from 'socket.io'
import onlineUser from "../common/class/onlineUser.class";
import notificationController from "../controllers/notification.controller";
import { createNotificationDto } from "../dto/notification.dto";

// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;

interface IonlineUsers {
    socketId: string,
    userId: string,
}
class NotificationSocket extends CommonSocketConfig {

    // userSockets: { [key: string]: any } = {};
    // onlineUsers: { [key: string]: IonlineUsers } = {}
    constructor(io: Server) {
        super("Notification", io)
        this.io = io;
    }


    configureSocket() {
        this.io.on('connection', (socket) => {

            socket.on("add_user", (data: IonlineUsers) => {
                onlineUser.addUser(data)
                // console.log(onlineUser.onlineUsers)
            })

            socket.on("request_notification", async (data: IonlineUsers) => {
                const notifications = await notificationController.notifications({ userId: data.userId })
                if (onlineUser.isUserOnline(data.userId)) {
                    this.io.sockets.to(data.socketId).emit("notifcations", notifications)
                }
            })

            socket.on("create_notification", async (data: createNotificationDto[]) => {


                const isCreatedSuccessFully = await notificationController.create({ data })
                // console.log("create-notfication-socket", { isCreatedSuccessFully })
                if (isCreatedSuccessFully) {

                    data.forEach(async (noti) => {
                        if (onlineUser.isUserOnline(noti.userId)) {
                            const notifications = await notificationController.notifications({ userId: noti.userId })
                            this.io.sockets.to(onlineUser.getSocketId(noti.userId)).emit("notifcations", notifications)
                            this.io.sockets.to(onlineUser.getSocketId(noti.userId)).emit("new_notification", data[0].subject)

                            // this.io
                            //     .sockets
                            //     .to(onlineUser.getSocketId(noti.userId))
                            //     .emit("notifcations", noti.subject)
                        }
                    })
                }
            })


            socket.on("create_annoucement", async (users: string[]) => {

                console.log("🚀 ~ file: notification.socket.config.ts:63 ~ NotificationSocket ~ socket.on ~ users:", users)

                // console.log("create-annoucement-socket", { users });

                users.forEach(async (id) => {
                    if (onlineUser.isUserOnline(id)) {
                        // console.log(true)
                        const notifications = await notificationController.notifications({ userId: id })

                        console.log("🚀 ~ file: notification.socket.config.ts:73 ~ NotificationSocket ~ users.forEach ~ onlineUser:", onlineUser.getSocketId(id))

                        this.io
                            .sockets
                            .to(onlineUser.getSocketId(id))
                            .emit("notifcations", notifications)


                        console.log("🚀 ~ file: notification.socket.config.ts:81 ~ NotificationSocket ~ users.forEach ~ this:", "new announcement")
                        this.io
                            .sockets
                            .to(onlineUser.getSocketId(id))
                            .emit("new_notification", "New Annoucement")

                    }

                })
            })



            socket.on("removeUser", (id) => {
                // console.log("removeUser", id)
                // console.log()
            })
        });


        return this.io;
    }

}

export default NotificationSocket