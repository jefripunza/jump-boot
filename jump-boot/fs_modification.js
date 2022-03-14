/**
 * Author      : Jefri Herdi Triyanto
 * Description : kebutuhan singkat untuk manajement fs
 */

const fs = require('fs');

module.exports = {
    createDirIfNotExist: (dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    },
};
