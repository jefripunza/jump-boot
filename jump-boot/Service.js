/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk mempermudah kebutuhan service
 */

const path = require('path');

const Jwt = require('./Jwt');
const {
    fixZeroDate,
    fixZeroMillisecond,
    mkdirIfNotExist,
} = require('./Helpers')

class Service {

    /**
   * @Autowired
   */
    jwt = Jwt.management;
    properties = require('./properties');
    fetcher = require('./fetcher');

    /**
   * make automatic props data to declare on constructor
   * @param {{}} props
   */
    setupProps(props) {
        if (props !== undefined) {
            Object.keys(props).forEach((key) => {
                // set all key in class
                this[key] = props[key];
            });
        }
    }

    // ============== File Management ============== //
    /**
     * save file
     * @param {{ file:*, directory:'string', file_name:'string', generate:'boolean' }} param0
     * @returns {string}
     */
    saveFile({ file, directory, file_name = false, generate = false }) {
        let fix_file_name = file_name ? file_name : file.name
        if (generate) {
            const now = new Date()
            const generated = [
                now.getFullYear(), fixZeroDate(now.getMonth() + 1), fixZeroDate(now.getDate()),
                fixZeroDate(now.getHours()), fixZeroDate(now.getMinutes()), fixZeroDate(now.getSeconds()), fixZeroMillisecond(now.getMilliseconds())
            ].map(v => String(v)).join('')
            fix_file_name = `${generated}-${fix_file_name}`
        }
        const target = path.join(__dirname, '..', 'public', directory)
        mkdirIfNotExist(target)
        const target_with_filename = path.join(target, fix_file_name)
        file.mv(target_with_filename)
        return target_with_filename
    }

    /**
   * for developing
   * @param {*} data
   * @returns
   */
    debug(data) {
        console.log(data); // don't delete this
        return data;
    }
}

module.exports = Service;
