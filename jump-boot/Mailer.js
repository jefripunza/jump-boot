/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk membuat SMTP mailer
 */

const nodemailer = require('nodemailer');

const { isArray, isString, isOdd } = require('./Helpers');
const { log } = require('./Styles');

const fs = require('fs');
const path = require('path');

class Mailer {
    // eslint-disable-next-line require-jsdoc
    #isValidateEnvNegative(EMAIL, PASS) {
        // eslint-disable-next-line require-jsdoc
        function negative(value) {
            return value === undefined || value === null || value === '';
        }
        return negative(EMAIL) && negative(PASS);
    }
    mailer_key_env = [
        'MAILER_EMAIL_LOCAL',
        'MAILER_PASS_LOCAL',
        'MAILER_EMAIL_DEV',
        'MAILER_PASS_DEV',
        'MAILER_EMAIL_PRODUCTION',
        'MAILER_PASS_PRODUCTION',
    ];
    // eslint-disable-next-line require-jsdoc
    #createMailerConfig() {
        return (
            this.mailer_key_env
                // eslint-disable-next-line id-length
                .map((v, i) => {
                    return isOdd(i + 1) ? `${v}=` : `${v}=\n`;
                })
                .join('\n')
        );
    }

    /**
   *
   * @param {[]} array
   * @returns
   */
    useTemplate(array) {
        return array.join('<br/>');
    }

    // ========================================================================

    // eslint-disable-next-line require-jsdoc
    constructor(option = {}) {
        if (
            this.#isValidateEnvNegative(
                process.env.MAILER_EMAIL_LOCAL,
                process.env.MAILER_PASS_LOCAL
            ) &&
            this.#isValidateEnvNegative(
                process.env.MAILER_EMAIL_DEV,
                process.env.MAILER_PASS_DEV
            ) &&
            this.#isValidateEnvNegative(
                process.env.MAILER_EMAIL_PRODUCTION,
                process.env.MAILER_PASS_PRODUCTION
            )
        ) {
            const path_env = path.join(__dirname, '..', '.env');
            if (!fs.existsSync(path_env)) {
                fs.writeFileSync(path_env, this.#createMailerConfig(), {
                    encoding: 'utf-8',
                });
            } else {
                const last_env = fs.readFileSync(path_env, { encoding: 'utf-8' });
                if (
                    // eslint-disable-next-line id-length
                    !this.mailer_key_env.some((v) => {
                        return last_env.includes(v);
                    })
                ) {
                    fs.writeFileSync(
                        path_env,
                        `${last_env}\n\n${this.#createMailerConfig()}`,
                        { encoding: 'utf-8' }
                    );
                }
            }
            console.log(
                'please fill in (MAILER_EMAIL_{}, MAILER_PASS_{}) in .env file !'
            );
            process.exit(1);
        } else if (
            !(
                (option.service ||
                    // eslint-disable-next-line id-length
                    ['host', 'port', 'secure'].some((v) => {
                        return Object.keys(option).includes(v);
                    })) &&
                option.auth
            )
        ) {
            console.log(
                'please fill option on declare class with "auth" and "host, port, secure" or only declare "service" and "auth" !'
            );
            process.exit(1);
        }
        this.connection = nodemailer.createTransport(option);
        log.running('nodemailer', 'Mailer is ready!');

        // ======== BINDING ======== //
        this.use = this.use.bind(this);
    }

    /**
   *
   * @param {string|array} emailTarget
   * @param {string} subject
   * @param {string} html
   * @returns
   */
    sendTo = (emailTarget, subject, html) => {
        let to = '';
        if (isArray(emailTarget)) {
            to = emailTarget.join(', ');
        } else if (isString(emailTarget)) {
            to = emailTarget;
        } else {
            throw new Error('please insert email target in format string or array');
        }
        return new Promise((resolve, reject) => {
            this.connection.sendMail(
                {
                    from: process.env.MAILER_EMAIL,
                    to,
                    subject,
                    html,
                },
                (error, info) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(info);
                    }
                }
            );
        });
    };

    /**
   *
   * @param {*} app
   */
    use = (app) => {
        app.use((req, res, next) => {
            req.mailer = {
                useTemplate: this.useTemplate,
                sendTo: this.sendTo,
            };
            next();
        });
    };
}

module.exports = Mailer;
