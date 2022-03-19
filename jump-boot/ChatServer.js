/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk membuat chat app
 */

const Models = require('./Models');
const { log } = require('./Styles');

class ChatServer extends Models {
    // eslint-disable-next-line require-jsdoc
    constructor(server, option) {
        super();

        delete option.callback
        this.option = option

        this.io = require('socket.io')(server);
    }

    // eslint-disable-next-line require-jsdoc
    run() {
        log.running('socket.io', 'Chat Server is starting!');
        return {
            io: this.io,
            option: this.option,
        };
    }
}

module.exports = ChatServer;
