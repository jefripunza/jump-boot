/**
 * Author      : Jefri Herdi Triyanto
 * Description : kebutuhan konfigurasi controller dan response
 */

const Service = require('./Service');
const { StatusCode } = require('./Enum');
const { isArray, array2csv } = require('./Helpers');

class Controller extends Service {
    // eslint-disable-next-line require-jsdoc
    constructor() {
        super(); // please don't delete this
    }

    /**
   * @Autowired
   */

    // =================== File Standard =================== //

    /**
   * Sending File to Response
   * @param {*} res
   * @param {string} path_file
   * @returns
   */
    sendFile(res, path_file) {
        return res.sendFile(path_file);
    }

    /**
   * Download File to Response
   * @param {*} res
   * @param {string} path_file
   * @returns
   */
    downloadFile(res, path_file) {
        return res.download(path_file);
    }

    // auto download

    /**
   * make CSV in output
   * @param {string} name_file
   * @param {[]} data
   */
    toCSV(res, name_file, data) {
        try {
            if (isArray(data)) {
                res.set('Content-Type', 'application/octet-stream');
                res.attachment(String(name_file).toLowerCase().endsWith('.csv') ? name_file : `${name_file}.csv`)
                return res.send(array2csv(data))
            }
            return this.sendServerErrorJson(res, 'data harus berbentuk array of object')
        } catch (error) {
            console.log('(toCSV) error:', error.message)
            return res.status(StatusCode.SERVER.INTERNAL_SERVER_ERROR).json({
                message: error.message
            })
        }
    }

    // =================== DTO Standard =================== //

    /**
   * Positive Response with HTML
   * @param {*} res
   * @param {string} html
   * @returns
   */
    sendSuccessHTML(res, html) {
        return res.status(StatusCode.SUCCESS.OK).send(html);
    }

    /**
   * Positive Response with JSON
   * @param {{}} res
   * @param {{}} data
   * @param {string} message
   * @returns
   */
    sendSuccessJson(res, data, message = false) {
        const insert_message = message ? { message } : {};
        return res.status(StatusCode.SUCCESS.OK).json({
            ...insert_message,
            ...data,
        });
    }

    /**
   * Negative Response (Client)
   * @param {{}} res
   * @param {string} html
   * @returns
   */
    sendClientErrorHTML(res, html) {
        return res.status(StatusCode.CLIENT.BAD_REQUEST).send(html);
    }

    /**
   * Negative Response (Client)
   * @param {{}} res
   * @param {string} message
   * @returns
   */
    sendClientErrorJson(res, message) {
        return res.status(StatusCode.CLIENT.BAD_REQUEST).json({
            message: message || 'bad request',
        });
    }

    /**
   * Negative Response (Server)
   * @param {{}} res
   * @param {string} html
   * @returns
   */
    sendServerErrorHTML(res, html) {
        return res.status(StatusCode.SERVER.INTERNAL_SERVER_ERROR).send(html);
    }

    /**
   * Negative Response (Server)
   * @param {{}} res
   * @param {string} message
   * @returns
   */
    sendServerErrorJson(res, message) {
        return res.status(StatusCode.SERVER.INTERNAL_SERVER_ERROR).json({
            message: message || 'internal server error',
        });
    }
}

module.exports = Controller;
