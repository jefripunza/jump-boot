/**
 * Author      : Jefri Herdi Triyanto
 * Description : run app untuk pertama kalo
 */

require('dotenv').config();
require('module-alias/register');

const path = require('path');
const fs = require('fs');

const path_package_json = path.join(__dirname, '..', 'package.json')
let package_json = require(path_package_json)

const {
    Server, ChatServer, Mailer, WhatsApp,
    isObject,
} = require('.');
const Main = require('../Main');

module.exports = new Promise(async (resolve, reject) => {

    const JumpBoot = new Main(); // core

    if (JumpBoot.clearTerminal) { // first
        console.log('\033[2J'); // clear CLI
    }

    // auto config
    await new Promise((next) => {
        const folder_project = String(__dirname).split('\\').reverse()[1]
        const { name } = package_json
        if (folder_project !== name) {
            package_json.name = folder_project
            const new_package_json = package_json
            fs.writeFileSync(path_package_json, JSON.stringify(new_package_json, null, 4), { encoding: 'utf-8' })
        }
        next()
    })

    // Global Variable
    let server = false
    let webserver = false;
    let routes = [];

    try {
        if (JumpBoot.server && isObject(JumpBoot.server)) {
            await new Promise(async (next) => {
                server = new Server(JumpBoot.server); // init all configure
                // ============= Database Connecting ============= //
                if (JumpBoot.server.database) {
                    await server.initDatabase();
                }
                webserver = await server.run();
                next()
            })
        }

        // =================== Web Socket =================== //
        if (JumpBoot.chatServer && isObject(JumpBoot.chatServer) && webserver) {
            const chatServer = new ChatServer(webserver.httpServer, JumpBoot.chatServer);
            const { io, option } = await chatServer.run();
            if (option.auth && Object.keys(option.auth).length > 0) {
                const { auth } = option
                // eslint-disable-next-line consistent-return
                io.use((socket, next) => {
                    const isAuth = Object.keys(auth).map(key => {
                        return socket.handshake.auth[key] === undefined ? undefined : auth[key] === socket.handshake.auth[key]
                    })
                    if (isAuth.includes(undefined)) {
                        const error = new Error('BAD_REQUEST');
                        error.data = 'your auth parameter not complete...'
                        return next(error);
                    } else if (isAuth.includes(false)) {
                        const error = new Error('UNAUTHORIZED');
                        error.data = 'invalid authentication'
                        return next(error);
                    }
                    return next();
                });
            }
            if (JumpBoot.chatServer.socket && typeof JumpBoot.chatServer.socket === 'function') {
                JumpBoot.chatServer.socket(io)
            }
        }

        // =================== Mailer =================== //
        if (JumpBoot.mailer && isObject(JumpBoot.mailer) && webserver) {
            const mailer = new Mailer(JumpBoot.mailer);
            mailer.use(webserver.app);
        }

        if (JumpBoot.whatsapp && isObject(JumpBoot.whatsapp) && webserver) {
            // ================ WhatsApp OTP ================ //
            const whatsapp = new WhatsApp(JumpBoot.whatsapp);
            whatsapp.use(webserver.app);
        }

        // == Last Configuration (WAJIB & run at last) == //
        if (server) {
            // Web Server (controller)
            routes = await server.loadControllers();
        }

        // RFP (Remote Frontend Package) (js-framework)
        if (server && (JumpBoot.rfp || JumpBoot.RFP) && (isObject(JumpBoot.rfp) || isObject(JumpBoot.RFP))) {
            server.renderClient(); // if use reactjs or others
        }

        if (server && webserver) {
            // console.log({ app: typeof webserver.app, httpServer: typeof webserver.httpServer, server });
            resolve({
                app: webserver.app,
                routes,
            });
        }
    } catch (error) {
        reject(error.message)
    }
})
