import Mysql2Database from '../database/Mysql2.database'
import { Socket } from 'socket.io'
import { createNotificationDto } from '../dto/notification.dto';
import { v4 as uuid4 } from 'uuid';
import mysql2 from 'mysql2/promise'
import UniquerId from '../common/class/uniquerId.class';

class NotificationController {


    async notifications({ userId }: { userId: string }) {
        const sqlQuery = `Select * from notification where userID = "${userId}" order by created_at desc limit 3`

        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [rows, _] = await connection.execute(sqlQuery)
            return { notifications: rows }
        } catch (error: any) {
            return { error: error.message }
        }
    }


    async create({ data }: { data: createNotificationDto[] }) {
        const query = 'INSERT INTO notification (notiID, userID, createrId, subject, body, link, fileName) VALUES ?';
        const __values =
            data.map(obj =>
                [
                    UniquerId.generate(),
                    obj.userId,
                    obj.createrId,
                    obj.subject,
                    obj.body,
                    obj.link,
                    (obj as any).fileName ?
                        (obj as any).fileName
                        :
                        JSON.stringify(null)
                ]
            );


        try {
            let connection: mysql2.Connection = await Mysql2Database.createConnection();
            const [rows, _] = await connection.query(query, [__values])
            // console.log("create-notification-controller", { rows })
            if ((rows as any).affectedRows > 0) {
                return true
            }
            else {
                return false;
            }

        } catch (error: any) {

            console.log(error.message)
            return false
        }

    }
}

export default new NotificationController()



