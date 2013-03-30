var App = function() {
    this.socket = io.connect(null);
    this.bindListeners();
    this.bindHandlers();
};

App.prototype.bindListeners = function() {
    this.socket.on('connect', function () {
        $('#info-message').html('Connection established!');
        $('input[name="message"]').val('\\nickname ');
        $('input[name="message"]').focus();
        $('button#send').prop('disabled', false);
        
        this.updateUserList();
        
        this.socket.on('updateUserList', function() {
            this.updateUserList();
        }.bind(this));
        
        this.socket.on('message', function(data) {
            this.appendMessage(data);
            $('#chat').scrollTo('max', {axis: 'y'});
        }.bind(this));
        
        this.socket.on('messageHistory', function(messages) {
            for(var i in messages) {
                this.appendMessage(messages[i]);
            }
            $('#chat').scrollTo('max', {axis: 'y'});
        }.bind(this));
        
        this.socket.on('disconnect', function(user) {
            $('#chat').append('<span class="chat-bold">' + user + '</span> disconnected.<br />');
            this.updateUserList();
            $('#chat').scrollTo('max', {axis: 'y'});
        }.bind(this));
        
        this.socket.on('setTopic', function(data) {
            $('#topic').html(data.topic);
            if(data.user)
                $('#chat').append('<span class="chat-bold">' + data.user + ' </span> set topic to ' + data.topic + '<br />');
        });
    }.bind(this));
};

App.prototype.appendMessage = function (data) {
    $('#chat').append('<span class="chat-bold">' + data.user + ': </span>' + data.message + '<br />');
};

App.prototype.bindHandlers = function() {
    $('button#send').click(function() {
        this.sendMessage();
    }.bind(this));
    
    $('input[name="message"]').keypress(function(e) {
        if(e.which == 13) this.sendMessage();
    }.bind(this));
};

App.prototype.sendMessage = function() {
    var val = $('input[name="message"]').val();
    
    if(val[0] == '\\') {
        var arr = val.split(' ');
        var cmd = arr[0].substring(1);
        arr.shift();
        this.socket.emit(cmd, arr.join(' '));
    } else {
        this.socket.emit('message', {message: val});
    }
    $('input[name="message"]').val('');
};

App.prototype.updateUserList = function () {
    this.socket.emit('getConnectedUsers', function(users) {
        $('#users').html('');
        for(var i in users) {
            $('#users').append(users[i] + '<br />');
        }
    });
};

new App();
