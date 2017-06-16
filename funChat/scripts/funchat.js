documentWidth = window.screen.availWidth;


/*if (documentWidth < 500) {
	wrapperWidth = documentWidth;
} else {
	wrapperWidth = 0.5 * documentWidth;
}*/

$(document).ready(function() {
	screenWidth();
});

function screenWidth() {
	if (documentWidth > 500) {
		wrapperWidth = 0.6 * documentWidth;
	} else {
		wrapperWidth = 0.85 * documentWidth;
	}

	$('.wrapper').css('width', wrapperWidth);
	$('.banner').css('width', wrapperWidth);
}

window.onload = function() {
	// 实例化初始化程序
	var funchat = new FunChat();
	funchat.init();
};

var FunChat = function() {
	// 定义FunChat类
	this.socket = null;
};

FunChat.prototype = {
	init: function() {
		// 初始化程序方法
		var that = this;
		// this,that
		this.socket = io.connect();
		//
		this.socket.on('connect', function() {
			// 连接服务器后，显示用户昵称输入框
			document.getElementById('info').textContent = '欢迎，请先取一个喜欢的昵称';
			document.getElementById('nickWrapper').style.display = 'block';
			document.getElementById('nicknameInput').focus();
		});
		// 用户昵称已经被使用
		this.socket.on('nickExisted',function() {
			document.getElementById('info').textContent = '此昵称已经被使用了，请重新选择一个';
		});
		// 用户昵称未被使用，登录成功
		this.socket.on('loginSuccess',function() {
			document.title = 'funchat | ' + document.getElementById('nicknameInput').value;
			// 登录成功以后进入聊天界面，隐藏遮盖层
			document.getElementById('loginWrapper').style.display = 'none';
			// 信息输入框获得焦点
			document.getElementById('messageInput').focus;
		});
		// 用户离开聊天
		/*this.socket.on('system',function(nickName,userCount,type) {
			// 判断用户连接或者离开，分别显示信息
			var msg = nickName + (type == 'login' ? '进来了' : '离开了');
			var p = document.createElement('p');
			p.textContent = msg;
			document.getElementById('historyMsg').appendChild(p);
			// 指定系统消息默认为红色
			that._displayNewMsg('system', msg, 'red');
			// 显示在线人数
			document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
		});*/
		this.socket.on('system', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' 进入聊天室' : ' 离开聊天室');
            that._displayNewMsg('system ', msg, 'red');
            document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });
		// 从服务器接收到聊天信息后，显示在聊天窗口
		this.socket.on('newMsg', function(user, msg, color) {
			that._displayNewMsg(user, msg, color);
		});
		// 接收服务器的图片，显示在聊天窗口
		this.socket.on('newImg', function(user, img) {
			that._displayNewMsg(user, img);
		});
		// 昵称的确认按钮
		document.getElementById('loginBtn').addEventListener('click',function() {
			// 检查昵称输入框是否为空
			var nickName = document.getElementById('nicknameInput').value;
			if (nickName.trim().length != 0) {
				// 若非空，则emit发出一个login事件并将用户输入的昵称发送到服务器
				that.socket.emit('login',nickName);
			} else {
				// 为空，输入框获得焦点
				document.getElementById('nicknameInput').focus();
			};
		}, false);
		// 
		document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        // 消息发送
        document.getElementById('sendBtn').addEventListener('click', function() {
        	var messageInput = document.getElementById('messageInput'),
        		msg = messageInput.value;
        		// 获取字体颜色
        		color = document.getElementById('colorStyle').value;
        	messageInput.value = '';
        	messageInput.focus();
        	if (msg.trim().length != 0) {
        		// 发送消息给服务器
        		that.socket.emit('postMsg', msg, color);
        		// 显示消息到聊天窗口
        		that._displayNewMsg('我', msg, color);
        	};
        }, false);
        // 清空屏幕
        document.getElementById('clearBtn').addEventListener('click', function() {
        	document.getElementById('historyMsg').innerHTML = '';
        });
        // 发送图片
        document.getElementById('sendImage').addEventListener('change', function() {
        	// 检查是否选中文件
        	if (this.files.length != 0) {
        		// 若选中文件,利用FileReader进行读取
        		var file = this.files[0];
        			reader = new FileReader();
        		if (!reader) {
        			that._displayNewMsg('system', '您的浏览器暂时不支持filereader', 'red');
        			this.value = '';
        			return ;
        		};
        		reader.onload = function(e) {
        			// 读取成功
        			this.value = '';
        			that.socket.emit('img', e.target.result);
        			that._displayImage('我', e.target.result);
        		};
        		reader.readAsDataURL(file);
        	};
        }, false);
        /*this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
        	var emojiWrapper = document.getElementById('emojiWrapper');
        	emojiWrapper.style.display = 'block';
        	e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
        	var emojiWrapper = document.getElementById('emojiWrapper');
        	if (e.target != emojiWrapper) {
        		emojiWrapper.style.display = 'none';
        	};
        });
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
        	// 获取被选择的表情
        	var target = e.target;
        	if (target.nodeName.toLowerCase == 'img') {
        		var messageInput = document.getElementById('messageInput');
        		messageInput.focus();
        		messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
        	};
        }, false);*/
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
	},
	// 消息机制
	_displayNewMsg: function(user, msg, color) {
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('p'),
			date = new Date().toTimeString().substr(0, 8);
			// 将消息中的表情转换成图片
			msg = this._showEmoji(msg);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},
	// 图片机制
	_displayImage: function(user, imgData, color) {
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('p'),
			date = new Date().toTimeString().substr(0, 8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br />' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},
	// 表情机制
	/*_initialEmoji: function() {
		// 加载表情包
		var emojiContainer = document.getElementById('emojiWrapper'),
			docFragment = document.createDocumentFragment();
		for (var i = 69; i > 0; i--) {
			var emojiItem = document.createElement('img');
			emojiItem.src = '../images/emoji/' + i + '.gif';
			emojiItem.title = i;
			docFragment.appendChild(emojiItem);
		};
		emojiContainer.appendChild(docFragment);
	},*/
	_initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../images/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
	// 显示表情
	/*_showEmoji: function(msg) {
		var match, result = msg,
			reg = /\[emoji:\d+\]/g,
			emojiIndex,
			totalEmojiNum = document.getElementById('emojiWrapper').children.length;
		while (match = reg.exec(msg)) {
			emojiIndex = match[0].slice(7, -1);
			if (emojiIndex > totalEmojiNum) {
				result = result.replace(match[0], '[X]');
			} else {
				result = result.replace(match[0], '<img class="emoji" src="../images/emoji/' + emojiIndex + '.gif" />');
			};
		};
		return result;
	}*/
	_showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../images/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    }
};
