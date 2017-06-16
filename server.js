/* 测试部分
// 引入http模块
var http = require("http"),
	// 创建一个服务器
	server = http.createServer(function(req, res) {
		// 部署服务器
		res.writeHead(200, {
			'Content-Type':'text/plain'
		});
		res.write("Hello World!");
		res.end();
	});
// 监听80端口，一般我们的服务器默认监听就是80端口
server.listen(80);
console.log("server started")*/

// 引入express模块
var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server);
	// users数组保存所有在线用户的昵称
	users = [];
	// 指定静态html文件的位置
	app.use('/', express.static(__dirname + '/funchat'));
server.listen(80,()=>console.log('success'));

io.on('connection', function (socket) {
	// 昵称设置
	socket.on('login', function(nickname) {
		if (users.indexOf(nickname) > -1) {
			socket.emit('nickExisted');
		} else {
			//socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			// 向所有连接到服务器的客户端发送当前登录用户的昵称
			io.sockets.emit('system', nickname, users.length, 'login');
		};
	});
	// 用户离开（断开连接）
	socket.on('disconnect',function() {
		// 删除users中断开连接的用户
		// users.splice(socket.userIndex,1);
		users.splice(users.indexOf(socket.nickname), 1);
		// 通知其他人某某已经退出聊天室
		socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});
	// 消息接收
	socket.on('postMsg', function(msg) {
		// 发送消息给其他所有在线用户
		socket.broadcast.emit('newMsg', socket.nickname, msg);
	});
	// 接收图片
	socket.on('img', function(imgData) {
		// 发送图片给其他所有在线用户
		socket.broadcast.emit('newImg', socket.nickname, imgData);
	})
});	