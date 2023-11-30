const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const mysql = require('mysql');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const portSettings = {
    path: 'COM10',      
    baudRate: 115200    
};
const port = new SerialPort(portSettings);
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "070927",
    database: "shs"
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

parser.on('data', (data) => {
    console.log(`카드 번호: ${data}`);
    let cardData = data.trim();

    if (cardData === '0x3 0x6A 0xC8 0xC5') {
        io.emit('cardMatch', '백동흔');
    } else if (cardData === '0x23 0x24 0x24 0xC6') {
        io.emit('cardMatch', '신희성');
    } else {
        console.log('등록된 카드가 아닙니다.');
    }
});

port.on('error', function(err) {
    console.log('Error: ', err.message);
});

server.listen(3000, () => {
    console.log('localhost:3000');
});
