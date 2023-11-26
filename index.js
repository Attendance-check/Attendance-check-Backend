const express = require('express');
const http = require('http');
const mariadb = require('mariadb');
const SerialPort = require('serialport').SerialPort;
const Readline = require('@serialport/parser-readline');
const socketIo = require('socket.io');

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

// 시리얼 포트 설정 (COM 포트를 확인하고 적절하게 변경하세요)
const serialPort = new SerialPort('COM11', { baudRate: 115200 });
const parser = serialPort.pipe(new Readline({ delimiter: '\r\n' }));

parser.on('data', async (data) => {
    console.log(`Received data: ${data}`);
    let conn;

    try {
        conn = await pool.getConnection();
        const uid = parseUID(data); // UID 추출

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
    // 아두이노에서 전송된 데이터에서 UID 부분만 추출
    const match = data.match(/UID Value:((?: 0x[0-9A-F]{2})+)/i);
    return match ? match[1].replace(/ 0x/g, '').toUpperCase() : null;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});