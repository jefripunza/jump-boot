/**
 * Author      : Jefri Herdi Triyanto
 * Description : program utama
 */

class Main {

    clearTerminal = true;

    server = {
        debug: true, // show endpoint if hit
        database: true, // use database
        doc: true, // like Swagger
        public_directory: true,
        maxUploadSize: 20, // MB
        // security
        cors: true,
        helmet: true,
        jwt: true,
    }

    chatServer = {
        auth: {
            username: 'anak_trans',
            password: 'preman_code',
        },
    }

    mailer = process.env.application === 'production' ?
        {
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAILER_EMAIL_PRODUCTION,
                pass: process.env.MAILER_PASS_PRODUCTION,
            },
        } :
        process.env.application === 'dev' ?
            {
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.MAILER_EMAIL_DEV,
                    pass: process.env.MAILER_PASS_DEV,
                },
            } :
            {
                // local (default)
                service: 'gmail',
                auth: {
                    user: process.env.MAILER_EMAIL_LOCAL,
                    pass: process.env.MAILER_PASS_LOCAL,
                },
            };

    whatsapp = {
        name: 'My Project Name',
    }
}

module.exports = Main;
