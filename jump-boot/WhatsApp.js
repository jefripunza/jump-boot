/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk membuat WhatsApp app
 */

// ============================== 1st ==============================
const fs = require('fs');
const path = require('path');

const { log } = require('./Styles');

// ============================== 3th ==============================
// whatsapp this module
const {
    default: WAConnection,
    DisconnectReason,
    useSingleFileAuthState,
    Mimetype,
} = require('@adiwajshing/baileys');
const QRCode = require('qrcode');
// eslint-disable-next-line id-length
const P = require('pino');
const pretty = require('pino-pretty');
const { Boom } = require('@hapi/boom');
// styling
const emoji = require('node-emoji');
// parsing data
const fetch = (...args) => {
    // eslint-disable-next-line no-shadow
    return import('node-fetch').then(({ default: fetch }) => {
        return fetch(...args);
    });
};
// text to speech
const googleTTS = require('google-tts-api');

// ============================== Function ==============================
const { generateRandomString } = require('./Helpers');
const { StatusCode } = require('./Enum');
const { createDirIfNotExist } = require('./fs_modification');

class WhatsApp {

    /**
   * WhatsApp Bot (baileys multi session)
   * @param {{ name:string, prefix:string }} option
   */
    constructor(option = {}) {
    // Save Auth Multi Device
        this.SESSION_NAME = path.join(__dirname, '..', 'whatsapp-session.json');
        const { state, saveState } = useSingleFileAuthState(this.SESSION_NAME);
        // console.log({ session_path: this.SESSION_NAME, state }); // debug
        // eslint-disable-next-line new-cap
        const sock = WAConnection({
            // eslint-disable-next-line new-cap
            logger: P({ level: 'info' }, pretty({ colorize: true })),
            version: [2, 2208, 7], // https://web.whatsapp.com/check-update?version=1&platform=web
            // logger: P({ level: 'trace' }),
            printQRInTerminal: true,
            auth: state,
            // implement to handle retries
            // eslint-disable-next-line no-unused-vars
            getMessage: async (key) => {
                return {
                    conversation: 'hello',
                };
            },
        });
        sock.ev.on('creds.update', saveState);
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            this.qr = qr;
            if (connection === 'close') {
                const shouldReconnect =
          new Boom(lastDisconnect.error)?.output?.statusCode !==
          DisconnectReason.loggedOut;
                // console.log('connection closed due to ', lastDisconnect.error.message, ', reconnecting ', shouldReconnect)
                log.error(
                    '@adiwajshing/baileys',
                    `connection closed due to ${lastDisconnect.error.message}, reconnecting ${shouldReconnect}`
                );
                if (lastDisconnect.error.message === 'Stream Errored') {
                    this.logout(() => {
                        // eslint-disable-next-line no-new
                        new WhatsApp(this.SESSION_NAME, option);
                    });
                } else if (lastDisconnect.error.message === 'Timed Out') {
                    // await sock.logout(() => {
                    // 	// new WhatsApp(this.SESSION_NAME, option)
                    // 	console.log('Session logout dan menyambungkan lagi');
                    // })
                }
                if (shouldReconnect) {
                    // reconnect if not logged out
                    // eslint-disable-next-line no-new
                    new WhatsApp(this.SESSION_NAME, option);
                }
            } else if (connection === 'open') {
                log.authenticate('@adiwajshing/baileys', 'WhatsApp is connected...');
            }
        });
        //
        this.sock = sock;
        //
        this.option = option;
        this.name = option.name ? option.name : 'WhatsApp OTP';
        this.prefix = option.prefix ? option.prefix : '!';

        log.running('@adiwajshing/baileys', 'WhatsApp is starting!');
    }

    /**
   *
   * @param {callback} onSuccess ketika selesai logout
   */
    logout(onSuccess) {
        this.deleteSession(() => {
            // this.sock.logout()
            onSuccess();
        });
    }
    // =============================== TEMPLATE ===============================
    /**
   *
   * @param {string} text
   * @param {boolean} before_enter
   * @returns
   */
    templateItemNormal = (text, before_enter = false) => {
        const value_enter = before_enter ? '\n' : '';
        return `${value_enter}${text}${value_enter}\n`;
    };
    templateItemEnter = () => {
        return '\n';
    };
    templateItemSkip = () => {
    // eslint-disable-next-line max-len
        return '  ​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\n';
    };

    /**
   *
   * @param {string} key
   * @param {string|array|{}} value
   * @param {boolean} enter
   * @returns
   */
    templateItemVariable = (key, value, enter = false) => {
        const value_enter = enter ? '\n' : '';
        let inject = '';
        if (this.isArray(value)) {
            inject =
        inject +
        value
        // eslint-disable-next-line id-length
            .map((v) => {
                return v;
            })
            .join('\n');
        } else if (this.isObject(value)) {
            inject =
        inject +
        Object.values(value)
        // eslint-disable-next-line id-length
            .map((v) => {
                return v;
            })
            .join('\n');
        } else {
            inject = inject + value;
        }
        return `${key} : ${value_enter + value_enter}${inject}\n${value_enter}`;
    };

    /**
   *
   * @param {string} title
   * @param {array} array
   * @returns
   */
    templateItemTitle = (title, array = false) => {
        const length = String(title).length;
        const alinyemen = 10 - length;
        const kanan_kiri = '='.repeat(alinyemen + length / 2);
        let print = `${kanan_kiri} ${title} ${kanan_kiri}\n`;
        if (array && this.isArray(array)) {
            print =
        print +
        array
        // eslint-disable-next-line id-length
            .map((v) => {
                return `- ${v}\n`;
            })
            .join('\n');
            print = `${print}\n\n`;
        }
        return print;
    };

    /**
   *
   * @param {string} title
   * @param {string} cmd
   * @param {string|array|{}} note
   * @returns
   */
    templateItemCommand = (title, cmd, note = false) => {
        const point_right = emoji.find('point_right').emoji;
        let inject = '';
        if (note) {
            inject = `${inject}\n`;
            if (this.isArray(note)) {
                inject =
          inject +
          note
          // eslint-disable-next-line id-length
              .map((v) => {
                  return `${v}\n`;
              })
              .join('');
            } else if (this.isObject(note)) {
                inject =
          inject +
          Object.keys(note)
              .map((key) => {
                  return `${key} : ${note[key]}\n`;
              })
              .join('');
            } else {
                inject = inject + note;
            }
        }
        const inject_cmd =
      String(cmd).length > 0 ? `\n${point_right} ${cmd}\n` : '';
        return `├ ${title} :${inject_cmd} ${inject}\n`;
    };

    /**
   *
   * @param {string} key
   * @param {array} array
   * @param {string|array|{}} enter
   */
    templateItemList = (key, array, enter = false) => {
        if (this.isArray(array)) {
            const value_enter = enter ? '\n' : '';
            const inject = array
            // eslint-disable-next-line id-length
                .map((v) => {
                    return `- ${v}`;
                })
                .join('');
            return `├ ${key} : \n${value_enter}${inject}${value_enter}\n`;
        }
        return '│';
    };

    /**
   *
   * @param {string} text
   * @returns
   */
    templateItemNext = (text = '') => {
        return `│ ${text}\n`;
    };

    /**
   *
   * @param {string} title
   * @param {array} text_array
   * @returns
   */
    templateFormat = (title, text_array) => {
        const text_inject = text_array.join('');
        return `┌─「 _*${title}*_ 」\n\n${text_inject}\n└─「 >> _*${this.name}*_ << 」`;
    };
    // ================================ DEFINE ================================
    blocked = [];
    // ================================ REQUEST ===============================
    /**
   *
   * @param {string} url
   * @param {boolean} post
   * @returns
   */
    fetchJson = async (url, post = false) => {
    // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            const request = await fetch(url, {
                headers: { 'User-Agent': 'okhttp/4.5.0' },
                method: post ? 'POST' : 'GET',
            });
            console.log({ request });
            if (
            // eslint-disable-next-line id-length
                [200].some((v) => {
                    return request.status === v;
                })
            ) {
                const data = await request.json();
                // eslint-disable-next-line no-underscore-dangle
                data._status = request.status;
                resolve(data);
            } else {
                resolve({
                    _status: request.status,
                    message: request.statusText,
                });
            }
        });
    };

    /**
   *
   * @param {string} url
   * @returns
   */
    getBuffer = async (url) => {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'okhttp/4.5.0' },
            method: 'GET',
        }); // dia harus mandiri
        const no_image = fs.readFileSync(
            path.join(__dirname, '..', 'src', 'no_image.jpg')
        );
        if (!res.ok) {
            return { type: 'image/jpeg', result: no_image };
        }
        let buff = await res.buffer();
        if (buff) {
            const type = res.headers.get('content-type');
            if (type === 'image/webp') {
                const new_buff = await sharp(buff).jpeg().toBuffer();
                buff = new_buff;
            }
            return { type, result: buff };
        }
        return null;
    };
    // =============================== FUNCTION ===============================
    /**
   *
   * @param {*} value
   * @returns
   */
    isArray(value) {
        return typeof value === 'object' && Array.isArray(value) && value !== null;
    }

    /**
   *
   * @param {*} value
   * @returns
   */
    isObject(value) {
        return typeof value === 'object' && !Array.isArray(value) && value !== null;
    }

    /**
   *
   * @param {string} location
   * @param {function} onSuccess
   */
    deleteFile = async (location, onSuccess) => {
        await fs.unlink(location, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            onSuccess();
        });
    };

    /**
   *
   * @param {function} onSuccess
   */
    deleteSession = async (onSuccess) => {
        await fs.unlink(this.SESSION_NAME, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Session file deleted!');
            onSuccess();
        });
    };

    /**
   *
   * @param {string} filename
   * @returns
   */
    temp = (filename) => {
        const tempDir = path.join(__dirname, 'Temp');
        createDirIfNotExist(tempDir);
        return path.join(tempDir, filename);
    };

    /**
   *
   * @param {number} bytes
   * @param {number} decimals
   * @returns
   */
    formatBytes = (bytes, decimals = 2) => {
        const fix_bytes = parseInt(bytes, 10),
            fix_decimals = parseInt(decimals, 10);
        if (fix_bytes === 0) {
            return '0 Bytes';
        }
        // eslint-disable-next-line id-length
        const k = 1024;
        const dm = fix_decimals < 0 ? 0 : fix_decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        // eslint-disable-next-line id-length
        const i = Math.floor(Math.log(fix_bytes) / Math.log(k));
        return `${parseFloat((fix_bytes / Math.pow(k, i)).toFixed(dm))} ${
            sizes[i]
        }`;
    };

    /**
   *
   * @param {string} extension
   * @returns
   */
    getRandomFile = (extension) => {
        return `${generateRandomString()}.${extension}`;
    };

    /**
   *
   * @param {string|number} number
   * @param {string} standard
   * @returns
   */
    formatter = (number, standard = '@c.us') => {
        let formatted = number;
        // const standard = '@c.us'; // @s.whatsapp.net / @c.us
        if (!String(formatted).endsWith('@g.us')) {
            // isGroup ? next
            // 1. Menghilangkan karakter selain angka
            formatted = number.replace(/\D/g, '');
            // 2. Menghilangkan angka 62 di depan (prefix)
            //    Kemudian diganti dengan 0
            if (formatted.startsWith('0')) {
                formatted = `62${formatted.substr(1)}`;
            }
            // 3. Tambahkan standar pengiriman whatsapp
            if (!String(formatted).endsWith(standard)) {
                formatted = formatted + standard;
            }
        }
        return formatted;
    };

    /**
   *
   * @param {number} seconds
   * @returns
   */
    detikKeWaktu = (seconds) => {
        const fix_seconds = parseInt(seconds, 10);
        // eslint-disable-next-line require-jsdoc
        function pad(saa) {
            return (saa < 10 ? '0' : '') + saa;
        }
        let hours = Math.floor(fix_seconds / (60 * 60));
        let minutes = Math.floor(fix_seconds % (60 * 60) / 60);
        let ok_seconds = Math.floor(fix_seconds % 60);
        return `${pad(hours)} Jam ${pad(minutes)} Menit ${pad(ok_seconds)} Detik`;
    };
    uptime = () => {
        const uptime = process.uptime();
        return this.detikKeWaktu(uptime);
    };
    // =============================== FUNCTION WHATSAPP ===============================
    /**
   *
   * @param {String|Number} from
   * @param {function} isTrue
   * @param {function} isNotFound
   */
    isRegisteredUser = async (from) => {
        const [result] = await this.sock.onWhatsApp(this.formatter(from));
        return result !== undefined && result.exists;
    };

    /**
   *
   * @param {String|Number} from
   * @param {function} value
   */
    getProfilePicture = async (from) => {
    // eslint-disable-next-line init-declarations
        let url;
        try {
            url = await this.conn.getProfilePicture(from);
        } catch {
            url =
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
        }
        return url;
    };

    /**
   *
   * @param {{}} member
   * @returns
   */
    getNameUser = (member) => {
        if (this.conn.user.jid === member.jid) {
            return this.name;
        }
        return member.notify || member.vname || member.jid;
    };

    /**
   *
   * @param {array} participants
   * @returns
   */
    getGroupAdmins = (participants) => {
        const admins = [];
        // eslint-disable-next-line id-length
        for (let i of participants) {
            // eslint-disable-next-line no-unused-expressions
            i.isAdmin ? admins.push(i) : '';
        }
        return admins;
    };
    // =================================================================
    // =================================================================
    // // Listen Family
    /**
   *
   * @param {*} value mendapatkan value dari QR agar bisa di lempar menjadi gambar di website
   */
    listenQR = async (value) => {
        this.sock.ev.on('connection.update', ({ qr }) => {
            // eslint-disable-next-line no-param-reassign
            qr = qr !== undefined ? qr : null;
            setTimeout(() => {
                QRCode.toDataURL(qr, (err, url) => {
                    value(url, err);
                });
            }, 5000);
        });
    };

    /**
   *
   * @param {object} client_info jika sudah terkoneksi maka akan mendapatkan informasi tentang client
   */
    listenConnected = async (client_info) => {
        const getPP = async (jid, img_url) => {
            img_url(await this.getProfilePicture(jid));
        };
        const option = this.option;
        // eslint-disable-next-line func-names
        await this.conn.on('open', async function () {
            // eslint-disable-next-line no-invalid-this
            const user = this.user;
            if (option.debug !== undefined) {
                console.log('WhatsApp Connected...');
                console.log(`oh hello ${user.name} (${user.jid})`);
            }
            await getPP(user.jid, (img_url) => {
                user.imgUrl = img_url;
                client_info(user);
            });
        });
    };

    /**
   *
   * @param {function} result mendapatkan jawaban mengapa bisa terputus
   */
    listenDisconnected = async (result) => {
        this.conn.on('close', (why) => {
            result(why);
        });
    };

    /**
   *
   * @param {function} value mendapatkan info baterai
   */
    listenBattery = async (value) => {
        this.conn.on('CB:action,,battery', (json) => {
            const batteryLevelStr = json[2][0][1].value;
            const batteryChargeStr = json[2][0][1].live;
            value({
                level: parseInt(batteryLevelStr, 10),
                charge: batteryChargeStr,
            });
        });
    };

    /**
   *
   * @param {function} receive mendengarkan semua pesan masuk
   */
    listenMessage = async (receive) => {

        /**
     * The universal event for anything that happens
     * New messages, updated messages, read & delivered messages, participants typing etc.
     */
        this.sock.ev.on('messages.upsert', async (msg) => {
            try {
                let chat = msg;

                if (chat.type !== 'notify') {
                    return;
                }
                chat = chat.messages[0];
                if (chat.key && chat.key.fromMe) {
                    return;
                }

                // if (!msg.key.fromMe && m.type === 'notify') {
                // 	console.log('replying to', m.messages[0].key.remoteJid)
                // }
                /* ========== Meta Utama ========== */
                const chatMessage = chat.message;
                const id = chat.key.id;
                const from = chat.key.remoteJid;
                // eslint-disable-next-line no-unused-vars
                const fromMe = chat.key.fromMe;
                const participant = chat.key.participant;
                const isGroup = from.endsWith('@g.us');
                const content = JSON.stringify(chat.message);
                // eslint-disable-next-line id-length
                const type = Object.keys(chat.message).find((v) => {
                    return v !== 'messageContextInfo';
                });
                // eslint-disable-next-line no-unused-vars
                const messageTimestamp = chat.messageTimestamp;
                const botNumber = `${
                    String(this.sock.user.id).split(':')[0]
                }@s.whatsapp.net`;
                const prefix = this.prefix;

                /* ============ Meta User ============ */
                const user_id = isGroup ? chat.key.participant : chat.key.remoteJid;
                const pushname = chat.pushName;

                /* ============ Meta Group ============= */
                const groupMetadata = isGroup ?
                    await this.sock.groupMetadata(from) :
                    null;
                const groupName = isGroup ? groupMetadata.subject : null;
                const groupId = isGroup ? groupMetadata.id : null;
                const groupMembers = isGroup ? groupMetadata.participants : null;
                const groupDesc = isGroup ? groupMetadata.desc : null;
                const groupAdmins = isGroup ? // eslint-disable-next-line id-length
                    this.getGroupAdmins(groupMembers).map((v) => {
                        return v.id;
                    }) :
                    [];
                const isBotGroupAdmin = groupAdmins.includes(botNumber);
                const isGroupAdmins = groupAdmins.includes(user_id);

                /* ========== Message type ========== */
                const isMedia =
          type === 'imageMessage' ||
          type === 'videoMessage' ||
          type === 'audioMessage' ||
          type === 'stickerMessage';
                const isAudio = type === 'audioMessage';
                const isImage = type === 'imageMessage';
                const isVideo = type === 'videoMessage';
                const isSticker = type === 'stickerMessage';
                const isDocument = type === 'documentMessage';
                const isButtonMessage = type === 'buttonsMessage';
                const isQuotedAudio =
          type === 'extendedTextMessage' && content.includes('audioMessage');
                const isQuotedImage =
          type === 'extendedTextMessage' && content.includes('imageMessage');
                const isQuotedVideo =
          type === 'extendedTextMessage' && content.includes('videoMessage');
                const isQuotedSticker =
          type === 'extendedTextMessage' && content.includes('stickerMessage');

                const message_prefix =
          type === 'conversation' &&
          chat.message.conversation.startsWith(this.prefix) ?
              chat.message.conversation :
              type === 'imageMessage' &&
              chat.message.imageMessage.caption !== null &&
              chat.message.imageMessage.caption.startsWith(this.prefix) ?
                  chat.message.imageMessage.caption :
                  type === 'videoMessage' &&
              chat.message.videoMessage.caption !== null &&
              chat.message.videoMessage.caption.startsWith(this.prefix) ?
                      chat.message.videoMessage.caption :
                      type === 'extendedTextMessage' &&
              chat.message.extendedTextMessage.text.startsWith(this.prefix) ?
                          chat.message.extendedTextMessage.text :
                          '';
                const message_button =
          type === 'buttonsResponseMessage' ?
              chat.message.buttonsResponseMessage.selectedButtonId :
              type === 'templateMessage' ?
                  chat.message.templateMessage.hydratedTemplate.quickReplyButton.id :
                  type === 'listResponseMessage' ?
                      chat.message.listResponseMessage.singleSelectReply.selectedRowId :
                      null;
                let message =
          type === 'conservation' ?
              chat.message.conversation :
              type === 'extendedTextMessage' ?
                  chat.message.extendedTextMessage.text :
                  type === 'imageMessage' ?
                      chat.message.imageMessage.caption :
                      type === 'videoMessage' ?
                          chat.message.videoMessage.caption :
                          null;
                message = String(message).startsWith(this.prefix) ? null : message;

                const command =
          message_button !== null ?
              message_button.toLowerCase() :
              String(message_prefix)
                  .slice(1)
                  .trim()
                  .split(/ +/)
                  .shift()
                  .toLowerCase();
                const args =
          message && typeof message !== 'object' ?
              message.trim().split(/ +/).slice(1) :
              message_prefix !== null ?
                  message_prefix.trim().split(/ +/).slice(1) :
                  null;
                const far = args !== null ? args.join(' ') : null;
                const isCmd =
          message && typeof message !== 'object' ?
              message.startsWith(this.prefix) :
              message_prefix !== null ?
                  message_prefix.startsWith(this.prefix) :
                  false;

                const fungsi = {
                    // ===============================================================================================
                    // read & sending method
                    readChat: async () => {
                        await this.sock.sendReceipt(from, participant, [id], 'read');
                    },

                    /**
           *
           * @param {string} message
           * @param {function} onSuccess
           * @param {function} onError
           */
                    // eslint-disable-next-line no-shadow
                    sendMessage: async (message, onSuccess = false, onError = false) => {
                        await this.sendMessage(
                            from,
                            message,
                            (result) => {
                                if (onSuccess) {
                                    onSuccess(result);
                                }
                            },
                            () => {
                                if (onError) {
                                    onError();
                                }
                            }
                        );
                    },

                    /**
           *
           * @param {string} message
           * @param {function} onSuccess
           */
                    // eslint-disable-next-line no-shadow
                    reply: async (message, onSuccess = false) => {
                        await this.reply(from, message, text, chat, (result) => {
                            if (onSuccess) {
                                onSuccess(result);
                            }
                        });
                    },
                    // ===============================================================================================
                    // error message
                    perintah_tidak_tersedia: async () => {
                        await fungsi.reply(
                            `maaf, perintah *${command}* tidak tersedia !!`,
                            () => {
                                console.log('wrong, command!');
                            }
                        );
                    },

                    /**
           *
           * @param {string} error
           */
                    send_error: async (error) => {
                        await fungsi.reply(`_*oh noo...*_ : ${error}`, () => {
                            console.error({ error });
                        });
                    },
                    // ===============================================================================================
                    // only
                    only_personal: async () => {
                        await fungsi.reply(
                            'maaf, perintah hanya bisa dilakukan pada personal chat!',
                            () => {
                                console.log('personal chat only!');
                            }
                        );
                    },
                    only_group: async () => {
                        await fungsi.reply(
                            'maaf, perintah hanya bisa dilakukan pada group chat!',
                            () => {
                                console.log('group chat only!');
                            }
                        );
                    },
                    // ===============================================================================================
                    // validation
                    /**
           *
           * @param {function} lolos
           */
                    only_admin: async (lolos) => {
                        if (isGroupAdmins) {
                            lolos();
                        } else {
                            await fungsi.reply(
                                'maaf, perintah hanya bisa dilakukan oleh admin !!',
                                () => {
                                    console.log('wrong , other user use command!');
                                }
                            );
                        }
                    },
                    // ===============================================================================================
                    // presences
                    chatRead: async () => {
                        await this.chatRead(from);
                    },
                    // ===============================================================================================
                    tts: async () => {
                        if (command === `${this.prefix}tts`) {
                            if (isGroup) {
                                const lang = args[0];
                                if (lang === 'list') {
                                    await fungsi.chatRead();
                                    await this.sendListLangTTS(from, text, chat, () => {
                                        console.log('list language TTS...');
                                    });
                                } else {
                                    const text = args
                                    // eslint-disable-next-line id-length
                                        .filter((v, i) => {
                                            return i > 0;
                                        })
                                        .join(' ');
                                    await this.sendTTS(
                                        from,
                                        chat,
                                        lang,
                                        text,
                                        async (error) => {
                                            await fungsi.chatRead();
                                            await fungsi.reply(error, () => {
                                                console.log('language not available!');
                                            });
                                        },
                                        () => {
                                            console.log('send TTS OK!');
                                        }
                                    );
                                }
                            } else {
                                await fungsi.only_group();
                            }
                        }
                    },
                    // ===============================================================================================
                    // // Extra Response
                    // eslint-disable-next-line id-length
                    p: async () => {
                        if (
                        // eslint-disable-next-line id-length
                            ['p'].some((v) => {
                                return String(message).toLowerCase() === v;
                            })
                        ) {
                            await fungsi.chatRead();
                            await fungsi.reply('budayakan mengucapkan salam...');
                        }
                    },
                    salam: async () => {
                        if (
                        // eslint-disable-next-line id-length
                            ['assala', 'asala'].some((v) => {
                                return String(message).toLowerCase().startsWith(v);
                            })
                        ) {
                            await fungsi.chatRead();
                            const user_join = global.join ? // eslint-disable-next-line id-length
                                global.join.filter((v) => {
                                    return (
                                        String(v.number).split('@')[0] ===
                      String(chat.participant).split('@')[0]
                                    );
                                }) :
                                [];
                            await fungsi.chatRead();
                            if (user_join.length > 0) {
                                await this.sendTTS(
                                    from,
                                    chat,
                                    'ms',
                                    `wa'alaikumsalam warahmatullahi wabarakatu ya ${user_join[0].name}`
                                );
                            } else {
                                try {
                                    const group_meta = await this.conn.groupMetadata(from);
                                    const user_meta = chat.key.fromMe ?
                                        this.conn.user : // eslint-disable-next-line id-length
                                        group_meta.participants.filter((v) => {
                                            return v.jid === chat.participant;
                                        })[0];
                                    const get_name = user_meta.notify || user_meta.vname || false;
                                    if (get_name) {
                                        await this.sendTTS(
                                            from,
                                            chat,
                                            'ms',
                                            `wa'alaikumsalam warahmatullahi wabarakatu ya ${get_name}`
                                        );
                                    } else {
                                        await this.sendTTS(
                                            from,
                                            chat,
                                            'ar',
                                            'wa\'alaikumsalam warahmatullahi wabarakatu'
                                        );
                                    }
                                } catch (error) {
                                    await this.sendTTS(
                                        from,
                                        chat,
                                        'ar',
                                        'wa\'alaikumsalam warahmatullahi wabarakatu'
                                    );
                                }
                            }
                        }
                    },
                    greetings: async () => {
                        const list = [
                            'halo',
                            'hallo',
                            'helo',
                            'hello',
                            'hi ',
                            'hy ',
                            'hai',
                            'hay',
                            'woi',
                            'woy',
                            'woey',
                        ];
                        if (
                        // eslint-disable-next-line id-length
                            list.some((v) => {
                                return String(message).toLowerCase().startsWith(v);
                            })
                        ) {
                            const intro = String(message).split(' ')[0];
                            await fungsi.chatRead();
                            await fungsi.reply(`${intro} juga...`);
                        }
                    },
                    // ===============================================================================================
                    // // testing zone
                    inject: async () => {
                        if (command === `${this.prefix}inject`) {
                            const inject = far;
                            const emot = emoji.find(inject);
                            await fungsi.reply(
                                JSON.stringify({
                                    inject,
                                    emot,
                                }),
                                () => {
                                    console.log('resend...');
                                }
                            );
                        }
                    },
                    // ===============================================================================================
                };

                // eslint-disable-next-line consistent-return
                return receive({
                    ...fungsi,
                    chat,
                    chatMessage,
                    isGroup,
                    from,
                    user_id,
                    botNumber,
                    // totalChat,
                    pushname,
                    message_prefix,
                    message,
                    content,
                    type,
                    prefix,
                    isMedia,
                    isImage,
                    isAudio,
                    isVideo,
                    isSticker,
                    isDocument,
                    isButtonMessage,
                    isQuotedAudio,
                    isQuotedImage,
                    isQuotedVideo,
                    isQuotedSticker,
                    // body,
                    // messagesLink,
                    command,
                    args,
                    far,
                    isCmd,
                    // grup
                    groupMetadata,
                    groupName,
                    groupId,
                    groupMembers,
                    groupDesc,
                    groupAdmins,
                    isBotGroupAdmin,
                    isGroupAdmins,
                });
            } catch (error) {
                console.log({ error });
            }
        });
    };
    listenBlocklist = () => {
        this.conn.on('CB:Blocklist', (json) => {
            if (this.blocked.length > 0) {
                return;
            }
            // eslint-disable-next-line id-length
            for (let i of json[1].blocklist) {
                this.blocked.push(i.replace('c.us', 's.whatsapp.net'));
            }
        });
    };
    // ==================================================================
    // // Function Family

    // ==================================================================
    // // Sender Family
    /**
   *
   * @param {String|Number} from
   * @param {String} message
   * @param {function} terkirim
   * @param {function} gagal_mengirim
   */
    sendMessage = async (
        from,
        message,
        terkirim = false,
        gagal_mengirim = false
    ) => {
        await this.sock
            .sendMessage(this.formatter(from), { text: message })
            .then((result) => {
                if (terkirim) {
                    terkirim(result);
                }
            })
            .catch((error) => {
                if (gagal_mengirim) {
                    gagal_mengirim(error);
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {string} message
   * @param {*} type
   * @param {*} chat
   * @param {function} onSuccess
   * @param {function} onError
   */
    reply = async (
        from,
        message,
        type,
        chat,
        onSuccess = false,
        onError = false
    ) => {
        await this.conn
            .sendMessage(from, message, type, { quoted: chat })
            .then((result) => {
                if (onSuccess) {
                    onSuccess(result);
                }
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {*} chat primary message
   * @param {string} message content text
   * @param {function} onSuccess
   * @param {function} onError
   */
    replyWithPictureAndQuote = async (
        chat,
        message,
        onSuccess = false,
        onError = false
    ) => {
        const group_id = chat.key.remoteJid;
        const sender = chat.participant;
        const imgUrl = await this.getProfilePicture(sender);
        const buffer = await this.getBuffer(imgUrl);
        this.conn
            .sendMessage(group_id, buffer.result, MessageType.image, {
                caption: message,
                quoted: chat,
            })
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                console.log({ error });
                if (onError) {
                    onError();
                }
            });
    };

    /**
   *
   * @param {*} chat
   * @param {string} message
   * @param {{}} buttonSetup
   * @param {function} onSuccess
   * @param {function} onError
   */
    replyWithPictureQuoteButton = async (
        chat,
        message,
        buttonSetup,
        onSuccess = false,
        onError = false
    ) => {
        const group_id = chat.key.remoteJid;
        const sender = chat.participant;
        const imgUrl = await this.getProfilePicture(sender);
        const buffer = await this.getBuffer(imgUrl);
        this.conn
            .sendMessage(group_id, buffer.result, MessageType.image, {
                caption: message,
                quoted: chat,
            })
            .then(async () => {
                await this.sendButton(
                    group_id,
                    chat,
                    buttonSetup.message,
                    buttonSetup.footer,
                    buttonSetup.button,
                    () => {
                        if (onSuccess) {
                            onSuccess();
                        }
                    }
                );
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {*} chat
   * @param {string} description
   * @param {{}} buttonText
   * @param {*} sections
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendList = async (
        from,
        chat,
        description,
        buttonText,
        sections,
        onSuccess = false,
        onError = false
    ) => {
        const button = {
            buttonText,
            description,
            sections: sections,
            listType: 1,
        };
        await this.conn
            .sendMessage(from, button, MessageType.listMessage, { quoted: chat })
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                console.log({ error });
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {String|Number} from
   * @param {String} message
   * @param {String} footer
   * @param {Array} array_button
   * @param {function} onSuccess
   */
    sendButton = async (
        from,
        chat,
        message,
        footer,
        array_buttons,
        onSuccess = false
    ) => {
    // send a buttons message!
    // eslint-disable-next-line id-length
        const buttons = array_buttons.map((v) => {
            return {
                // eslint-disable-next-line no-useless-escape
                buttonId: `id_${String(v).toLowerCase().replace(/\ /g, '_')}`,
                buttonText: { displayText: v },
                type: 1,
            };
        });
        const buttonMessage = {
            contentText: message,
            footerText: footer,
            buttons: buttons,
            headerType: 1,
        };
        await this.conn
            .sendMessage(
                this.formatter(from),
                buttonMessage,
                MessageType.buttonsMessage,
                { quoted: chat }
            )
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {*} chat
   * @param {string} audio_location
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendAudio = async (
        from,
        chat,
        audio_location,
        onSuccess = false,
        onError = false
    ) => {
        await this.conn
            .sendMessage(
                this.formatter(from),
                { url: audio_location },
                MessageType.audio,
                { mimetype: Mimetype.mp4Audio, quoted: chat }
            )
            .then(async () => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {*} buffer
   * @param {*} chat
   * @param {string} caption
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendImage = async (
        from,
        buffer,
        chat,
        caption = '',
        onSuccess = false,
        onError = false
    ) => {
        await this.conn
            .sendMessage(from, buffer, MessageType.image, {
                // eslint-disable-next-line max-lines
                caption: caption,
                quoted: chat,
            })
            .then(async () => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {*} buffer
   * @param {*} chat
   * @param {string} caption
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendVideo = async (
        from,
        buffer,
        chat,
        caption = '',
        onSuccess = false,
        onError = false
    ) => {
        await this.conn
            .sendMessage(from, buffer, MessageType.video, {
                caption: caption,
                quoted: chat,
            })
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {*} buffer
   * @param {*} chat
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendSticker = async (
        from,
        buffer,
        chat,
        onSuccess = false,
        onError = false
    ) => {
        await this.conn
            .sendMessage(from, buffer, MessageType.sticker, { quoted: chat })
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {*} buffer
   * @param {string} title
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendPdf = async (
        from,
        buffer,
        title = 'myDocument.pdf',
        onSuccess = false,
        onError = false
    ) => {
        await this.conn
            .sendMessage(from, buffer, MessageType.document, {
                mimetype: Mimetype.pdf,
                title: title,
            })
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {*} buffer
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendGif = async (from, buffer, onSuccess = false, onError = false) => {
        await this.conn
            .sendMessage(from, buffer, MessageType.video, { mimetype: Mimetype.gif })
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    /**
   *
   * @param {string} from
   * @param {string} nomor
   * @param {string} nama
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendContact = async (
        from,
        nomor,
        nama,
        onSuccess = false,
        onError = false
    ) => {
        const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${nama}\n` +
      'ORG:Kontak\n' +
      `TEL;type=CELL;type=VOICE;waid=${nomor}:+${nomor}\n` +
      'END:VCARD';
        await this.conn
            .sendMessage(
                from,
                { displayname: nama, vcard: vcard },
                MessageType.contact
            )
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => {
                if (onError) {
                    onError(error);
                }
            });
    };

    // =================================================================
    // // Define Requirements
    available_lang = [
        { af: 'Afrikaans' },
        { sq: 'Albanian' },
        { ar: 'Arabic' },
        { hy: 'Armenian' },
        { bn: 'Bangladesh' },
        { bs: 'Bosnian' },
        { bg: 'Bulgarian' },
        { ca: 'Spain' },
        { zh: 'Mandarin' },
        { hr: 'Croatian' },
        { cs: 'Czech' },
        { da: 'Denmark' },
        { nl: 'Netherlands' },
        { en: 'English' },
        { et: 'Estonian' },
        { fi: 'Finland' },
        { fr: 'France' },
        { de: 'Germany' },
        { el: 'Greece' },
        { gu: 'Gujarati' },
        { hi: 'Hindi' },
        { hu: 'Hungarian' },
        { is: 'Iceland' },
        { id: 'Indonesia' },
        { it: 'Italian' },
        { ja: 'Japanese' },
        { kn: 'Kannada' },
        { km: 'Cambodia' },
        { ko: 'South Korea' },
        { lv: 'Latvian' },
        { mk: 'Macedonian' },
        { ms: 'Malaysia' },
        { ml: 'Malayalam' },
        { mr: 'Marathi' },
        { ne: 'Nepal' },
        { no: 'Norwegian' },
        { pl: 'Poland' },
        { pt: 'Portuguese' },
        { ro: 'Romanian' },
        { ru: 'Russian' },
        { sr: 'Serbian' },
        { si: 'Sri Lanka' },
        { sk: 'Slovakia' },
        { es: 'Spanish' },
        { su: 'Sundanese' },
        { sw: 'Swahili' },
        { sv: 'Swedish' },
        { ta: 'Tamil' },
        { te: 'Telugu' },
        { th: 'Thailand' },
        { tr: 'Turkey' },
        { uk: 'Ukrainian' },
        { ur: 'Urdu' },
        { vi: 'Vietnamese' },
    ];

    /**
   *
   * @param {string} from
   * @param {string} text
   * @param {*} chat
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendListLangTTS = async (
        from,
        text,
        chat,
        onSuccess = false,
        onError = false
    ) => {
        const inject = this.available_lang.map((lang) => {
            return this.templateItemVariable(Object.keys(lang), Object.values(lang));
        });
        await this.reply(
            from,
            this.templateFormat('Speech Language Available', [...inject]),
            text,
            chat,
            () => {
                if (onSuccess) {
                    onSuccess();
                }
            },
            () => {
                if (onError) {
                    onError();
                }
            }
        );
    };
    // =================================================================
    // // Addon
    /**
   *
   * @param {String} lang
   * @param {String} text_speech
   * @param {String} mp3_path
   * @param {function} lang_not_available
   */
    getTTS = async (lang, text_speech, mp3_path, lang_not_available = false) => {
    // eslint-disable-next-line id-length
        const only_key = this.available_lang.map((v) => {
            return Object.keys(v)[0];
        });
        if (
            only_key.some((available) => {
                return available === lang;
            })
        ) {
            try {
                await googleTTS
                    .getAudioBase64(text_speech, { lang, slow: false })
                    .then((base64) => {
                        // save the audio file
                        const buffer = Buffer.from(base64, 'base64');
                        const ran = generateRandomString();
                        const locationSave = this.temp(`${ran}.mp3`);
                        fs.writeFile(locationSave, buffer, { encoding: 'base64' }, () => {
                            mp3_path(locationSave);
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                        if (lang_not_available) {
                            lang_not_available(error);
                        }
                    });
            } catch (error) {
                if (lang_not_available) {
                    lang_not_available(error);
                }
            }
        } else if (lang_not_available) {
            lang_not_available(`maaf, untuk kode bahasa *${lang}* tidak tersedia!`);
        }
    };

    /**
   *
   * @param {string} from
   * @param {string} lang
   * @param {string} text_speech
   * @param {function} lang_not_available
   * @param {function} onSuccess
   * @param {function} onError
   */
    sendTTS = async (
        from,
        lang,
        text_speech,
        lang_not_available = false,
        onSuccess = false,
        onError = false
    ) => {
        const lower_lang = String(lang).toLowerCase();
        await this.getTTS(
            lower_lang,
            text_speech,
            async (mp3_path) => {
                await this.sock
                    .sendMessage(
                        this.formatter(from),
                        { audio: { url: mp3_path }, mimetype: 'audio/mp4' },
                        { url: mp3_path } // can send mp3, mp4, & ogg
                    )
                    .then(() => {
                        this.deleteFile(mp3_path, () => {
                            if (onSuccess) {
                                onSuccess();
                            }
                        });
                    })
                    .catch((error) => {
                        if (onError) {
                            onError(error.message);
                        }
                    });
            },
            (error) => {
                if (lang_not_available) {
                    lang_not_available(error);
                }
            }
        );
    };
    // ==================================================================
    // // Function for Backend
    /**
   *
   * @param {string} to
   * @param {string} otp
   */
    sendOTP = async (to, otp) => {
    // eslint-disable-next-line no-async-promise-executor
        return await new Promise(async (resolve, reject) => {
            if (await this.isRegisteredUser(to)) {
                this.sendMessage(
                    this.formatter(to, '@s.whatsapp.net'),
                    this.templateFormat('OTP', [
                        this.templateItemVariable('Kode OTP', String(otp).toUpperCase()),
                        this.templateItemNormal(
                            '_*jangan bagikan kode OTP ini ke orang lain*_'
                        ),
                    ])
                )
                    .then(() => {
                        resolve({
                            code: StatusCode.SUCCESS.OK,
                            otp,
                            to,
                        });
                    })
                    .catch((error) => {
                        reject({
                            code: StatusCode.SERVER.INTERNAL_SERVER_ERROR,
                            message: error.message,
                        });
                    });
            } else {
                reject({
                    code: StatusCode.CLIENT.BAD_REQUEST,
                    message: 'nomer whatsapp tidak terdaftar',
                });
            }
        });
    };

    /**
   *
   * @param {*} app
   */
    use = (app) => {
        app.use((req, res, next) => {
            req.whatsapp = {
                // function
                isRegisteredUser: this.isRegisteredUser, // ok

                // listener
                listenDisconnected: this.listenDisconnected,
                listenQR: this.listenQR,
                listenConnected: this.listenConnected,

                listenBattery: this.listenBattery,
                listenMessage: this.listenMessage,

                // sender
                sendMessage: this.sendMessage, // ok
                reply: this.reply,
                replyWithPictureAndQuote: this.replyWithPictureAndQuote,
                replyWithPictureQuoteButton: this.replyWithPictureQuoteButton,
                sendList: this.sendList,
                sendButton: this.sendButton,
                sendAudio: this.sendAudio,
                sendImage: this.sendImage,
                sendVideo: this.sendVideo,
                sendSticker: this.sendSticker,
                sendPdf: this.sendPdf,
                sendGif: this.sendGif,
                sendContact: this.sendContact,
                sendListLangTTS: this.sendListLangTTS,
                sendTTS: this.sendTTS, // ok
                sendOTP: this.sendOTP, // ok
            };
            next();
        });
    };
}

module.exports = WhatsApp;
