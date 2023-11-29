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

// MySQL 데이터베이스 연결 정보 설정
const db = mysql.createConnection({
    host: "localhost",       // 데이터베이스 호스트 주소
    user: "root",            // 데이터베이스 사용자 이름
    password: "070927",      // 데이터베이스 비밀번호
    database: "shs"          // 사용할 데이터베이스 이름
});

// 데이터베이스 연결
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// 시리얼 포트로부터 데이터 읽기
parser.on('data', (data) => {
    console.log(`Received data: ${data}`);
    let cardData = data.trim();

    // 데이터베이스에서 카드 정보 조회
    db.query('SELECT * FROM pn532 WHERE uid = ?', [cardData], (err, results) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (results.length > 0) {
            console.log('Card matched: ', results[0]);
            console.log('신희성'); // 일치하는 경우 1 출력
        } else {
            console.log('Card not found');
        }
    });h
});

// 포트 열기 에러 처리
port.on('error', function(err) {
    console.log('Error: ', err.message);
});
