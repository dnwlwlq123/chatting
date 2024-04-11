const express = require('express');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

//sql 연동
const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'miniproject'
});

connection.connect();

connection.query('SELECT * from chating', (error, rows, fields) => {
  if (error) throw error;
  console.log('User info is: ', rows);
});

connection.end();




// view engine setup
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

// 소켓 이벤트 처리
io.on('connection', (socket) => {
  console.log(ER_USERNAME, '과 연결되었습니다.');

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