const express = require('express');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();
const axios = require('./node_modules/axios/dist/axios.js');
// const utils = require('./utils.js');
const server = http.createServer(app);
const io = require('socket.io')(server);


//-------------------------------------------------sql 연동
const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'miniproject',
  dataString : 'date'
});

connection.connect();


// 이미 선언된 io 변수가 있을 때는 새로운 변수명으로 socket.io를 가져옵니다.

//const io = socketIO(server);



connection.query('SELECT username FROM chating WHERE username = "박정연"', (error, result, fields) => {
  if (error) {
    console.error('쿼리 실행 중 에러 발생:', error);
    // 에러 처리: 에러가 발생하면 여기서 종료하고 에러를 출력합니다.
    return;
  }

  console.log(result);

  io.on('connection', (socket) => {
    socket.on('username', function (username) {
      console.log('사용자와 연결되었습니다.');
    });

  // 쿼리 결과가 있는 경우에만 socket.emit을 호출
  if (result.length > 0) {
    const username = result[0].username;
    // 클라이언트로 UserId 보내기
    socket.emit('username', username);
  }
  // 소켓 이벤트 처리


    // 여기에 소켓 이벤트 핸들러 추가
    socket.on('msg', (message) => {
      console.log('메시지를 받았습니다:', message);
      // 받은 메시지를 모든 클라이언트에게 전송
      socket.broadcast.emit('msg', message);
    });



    // 클라이언트와의 연결이 종료되었을 때 처리
    socket.on('disconnect', () => {
      console.log('사용자와의 연결이 종료되었습니다.');
    });
  });

// HTTP 서버를 시작합니다.
  const port = 3000;
  server.listen(port, () => {
    console.log('서버주소: localhost ' + port);
  });

  connection.end();
});


app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// 미들웨어 등록
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 라우터 등록
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const {ER_USERNAME} = require("mysql/lib/protocol/constants/errors");
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 에러 핸들러 등록
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

