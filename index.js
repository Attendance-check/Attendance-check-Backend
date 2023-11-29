const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const mysql = require('mysql');

// 시리얼 포트 설정
const portSettings = {
    path: 'COM10',      // 시리얼 포트 경로
    baudRate: 115200    // 보드 레이트 (통신 속도)
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
    console.log(`Received data: ${data}`);
    let cardData = data.trim();

    
    db.query('SELECT * FROM pn532 WHERE uid = ?', [cardData], (err, results) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (results.length > 0) {
            console.log('Card matched: ', results[0]);
            console.log('신희성');
        } else {
            console.log('Card not found');
        }
    });h
});


port.on('error', function(err) {
    console.log('Error: ', err.message);
});
