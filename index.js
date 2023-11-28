const express = require('express');
const http = require('http');
const mariadb = require('mariadb');
const SerialPort = require('serialport').SerialPort;
const Readline = require('@serialport/parser-readline');
const socketIo = require('socket.io');
const path = require('path'); // 주석 해제

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3001;

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '070927',
    database: 'shs'
});

let serialPort;
try {
    serialPort = new SerialPort('COM10', { baudRate: 115200 });
} catch (err) {
    console.error('SerialPort Initialization Error:', err);
    process.exit(1);
}

const parser = serialPort.pipe(new Readline({ delimiter: '\r\n' }));

parser.on('data', async (data) => {
    console.log(`Received data: ${data}`);
    let conn;

    try {
        conn = await pool.getConnection();
        const uid = parseUID(data);

        const rows = await conn.query("SELECT uid FROM pn532 WHERE uid = ?", [uid]);

        if (rows.length === 0) {
            io.emit('nfcData', { uid: uid, message: "등록되지 않은 카드입니다." });
        } else {
            io.emit('nfcData', { uid: uid, message: "등록된 카드입니다." });
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) conn.end();
    }
});

function parseUID(data) {
    const match = data.match(/UID Value:((?: 0x[0-9A-F]{2})+)/i);
    return match ? match[1].replace(/ 0x/g, '').toUpperCase() : null;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // path.join 사용
});

server.listen(port, () => {
    console.log(`localhost:${port}`);
});
