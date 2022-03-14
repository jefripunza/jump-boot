/**
 * Author      : Jefri Herdi Triyanto
 * Description : run app untuk pertama kalo
 */

require('dotenv').config();
require('module-alias/register');

const { Server, ChatServer, Mailer, WhatsApp } = require('.');
const Main = require('../Main');

// eslint-disable-next-line no-async-promise-executor
module.exports = new Promise(async (resolve, reject) => {

    const JumpBoots = new Main(); // core

    if (JumpBoots.clearTerminal) {
        console.log('\033[2J'); // clear CLI
    }

    // Global Variable
    let server = false
    let webserver = false;
    let routes = [];

    try {
        if (JumpBoots.server) {
            server = new Server(JumpBoots.server); // init all configure
            // ============= Database Connecting ============= //
            if (JumpBoots.server.database) {
                await server.initDatabase();
            }
            webserver = await server.run();
        }

        // =================== Web Socket =================== //
        if (JumpBoots.chatServer && webserver) {
            const chatServer = new ChatServer(webserver.httpServer, JumpBoots.chatServer);
            const io = await chatServer.run();
            if (JumpBoots.chatServer.callback) {
                JumpBoots.chatServer.callback((websocket) => { // callback
                    websocket(io)
                })
            }
        }

        // =================== Mailer =================== //
        if (JumpBoots.mailer && webserver) {
            const mailer = new Mailer(JumpBoots.mailer);
            mailer.use(webserver.app);
        }

        if (JumpBoots.whatsapp && webserver) {
            // ================ WhatsApp OTP ================ //
            const whatsapp = new WhatsApp(JumpBoots.whatsapp);
            whatsapp.use(webserver.app);
        }

        // == Last Configuration (WAJIB & run at last) == //
        if (server) {
            // Web Server (controller)
            routes = await server.loadControllers();
        }

        // RFP (Remote Frontend Package) (js-framework)
        if (server && (JumpBoots.rfp || JumpBoots.RFP)) {
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
