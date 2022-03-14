/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk membuat chat app
 */

const Models = require('./Models');
const { log } = require('./Styles');

const Events = {
    CONNECTION: 'connection',
    INIT: 'init',
    TYPING: 'typing',
    MESSAGE: 'message',
    DISCONNECT: 'disconnect',
};

class ChatServer extends Models {
    // eslint-disable-next-line require-jsdoc
    constructor(server, option) {
        super();

        delete option.callback
        this.option = option

        this.io = require('socket.io')(server);
    }

    Events = Events;

    // cache management
    messages = [];
    users = {};

    // eslint-disable-next-line require-jsdoc
    run() {
        log.running('socket.io', 'Chat Server is starting!');
        this.io.on(Events.CONNECTION, (socket) => {
            const { id } = socket;
            socket.on(Events.INIT, async () => {
                console.log(`SOCKET: init ${id}`);
                if (this.option.cache) {
                    this.users[id] = socket
                    socket.emit('init', { messages: this.messages, users: this.users });
                }
            });
            socket.on(Events.TYPING, async (typing) => {
                this.io.emit(Events.TYPING, typing);
            });
            socket.on(Events.MESSAGE, async (msg) => {
                const message = {
                    id,
                    message: msg,
                };
                if (this.option.cache) {
                    this.messages.push(message);
                }
                this.io.emit(Events.MESSAGE, message);
            });
            socket.on(Events.DISCONNECT, async () => {
                if (this.option.cache) {
                    delete this.users[id]
                }
                console.log(`SOCKET: disconnect ${id}`);
            });
        });
        return this.io;
    }
}

module.exports = ChatServer;
