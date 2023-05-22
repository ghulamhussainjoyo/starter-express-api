import mysql from 'mysql2/promise';
import { dbConfig } from "../common/config";


class Database {
    async createConnection() {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    }
}

export default new Database()