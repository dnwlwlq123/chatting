const express = require('express');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

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
  console.log('a user connected');

  // 여기에 소켓 이벤트 핸들러 추가
});

// HTTP 서버를 시작합니다.
const port = 3000;
server.listen(port, () => {
  console.log('Server listening on port ' + port);
});