/**
 * Author      : Jefri Herdi Triyanto
 * Description : membuat fungsi2 pembantu
 */

const fs = require('fs');

const { HeadersMetaDefaultConstant } = require('./Enum');

const { exec } = require('child_process');

const {
    networkInterfaces,
    platform, // 'win32' 'linux' 'darwin'
} = require('os');
const nets = networkInterfaces();

// ======================================================================================
// Specific Function for Jump Boot

/**
 *
 * @param {{}} headers get from receive headers
 * @param {{}} HeadersMetaConstant enumeration headers something like DTO
 * @returns
 */
function getHeaders(headers, HeadersMetaConstant) {
    // eslint-disable-next-line no-use-before-define
    const lower_headers = objectKeyToLowercase(headers);
    return Object.keys(HeadersMetaConstant).reduce((prev, key) => {
        const fix_key = Object.keys(lower_headers)[HeadersMetaConstant[key]] ?
            lower_headers[HeadersMetaConstant[key]] :
            HeadersMetaConstant[key];
        return {
            ...prev,
            [fix_key]: lower_headers[HeadersMetaConstant[key]] ?
                lower_headers[HeadersMetaConstant[key]] :
                fix_key === HeadersMetaDefaultConstant.HEADER_USER_AGENT ? // eslint-disable-next-line max-len
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36' :
                    null, // selain user-agent itu null
        };
    }, {});
}

// ======================================================================================
// Validation

/**
 * menentukan apakah sekarang isi production
 * @returns
 */
const isProduction = () => {
    return Boolean(String(process.env.NODE_ENV).includes('production'));
};

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Simple array check.
 * @param value
 * @returns {boolean}
 */
function isArray(value) {
    return value && typeof value === 'object' && Array.isArray(value);
}

/**
 *
 * @param {*} value
 * @returns {boolean}
 */
function isString(value) {
    return value && typeof value === 'string';
}

/**
 *
 * @param {*} value
 * @returns
 */
function isNumber(value) {
    return !isNaN(value)
}

/**
 * Check if value undefined or null
 * @param {string|number|boolean|array|object} value
 * @returns {boolean}
 */
function isEmpty(value) {
    return value === undefined || value === null;
}

/**
 * Check if number value is odd
 * @param {number} num
 * @returns
 */
const isOdd = (num) => {
    return num % 2 === 1;
};

/**
 * Check if string value is JSON
 * @param {string} str
 * @returns
 */
function IsJsonString(str) {
    if (typeof str != 'string') {
        return false;
    }
    try {
        JSON.parse(str);
        // eslint-disable-next-line id-length
    } catch (e) {
        return false;
    }
    return true;
}

const isEmail = (email) => {
    return email.match(
        // eslint-disable-next-line max-len
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) !== null
};

// ======================================================================================
// Generator

/**
 * Generate Random Integer only
 * @param {number} min
 * @param {number} max
 * @returns
 */
function generateRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Generate Random String only
 * @param {number} length
 * @returns
 */
function generateRandomString(length = 20) {
    let result = '';
    let characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    // eslint-disable-next-line id-length
    for (let i = 0; i < length; i++) {
        result =
            result + characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Generate Random String + Number khusus OTP
 * @param {number} length
 * @returns
 */
function generateRandomOTP(length = 4) {
    let result = '';
    let characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let charactersLength = characters.length;
    // eslint-disable-next-line id-length
    for (let i = 0; i < length; i++) {
        result =
            result + characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * membuat kelipatan angka dari 1 ke n di array
 * @param {number} num
 * @returns
 */
function multipleDigits(num) {
    let text = '';
    // eslint-disable-next-line id-length
    for (let i = 0; i < num; i++) {
        if (i > 0) {
            text = `${text},`;
        }
        text = text + String(i + 1);
    }
    return text.split(',');
}

// ======================================================================================
// Search Engine

/**
 * for searching, membuat keyword dari sebuah kalimat
 * @param {string} query
 * @returns
 */
function get_keywords(query) {
    return String(query)
        .toLowerCase()
        .replace(/[^a-z0-9_\s]/g, '') // only alphabet and number
        .split(/\s+/g) // split per word
        .filter((data, pos, self) => {
            // remove duplicate word
            return self.indexOf(data) === pos;
        })
        .filter((data) => {
            // remove f*ck character
            return data !== '';
        })
        .map((token) => {
            // remove verb
            return token.replace(/(ing|s)$/, '');
        })
        .sort(); // ASC a~z | 0~9
}

// ======================================================================================
// Calculate

/**
 * menghitung umur menggunakan tahun
 * @param {number} tahun
 * @returns
 */
function calculate_age(tahun) {
    return new Date().getFullYear() - tahun;
}

/**
 * menghitung hari menggunakan timestamp
 * @param {number} timestamp_awal
 * @param {number} timestamp_akhir
 * @returns
 */
const day_count = (timestamp_awal, timestamp_akhir) => {
    return Math.ceil(
        Math.abs(timestamp_awal - timestamp_akhir) / (1000 * 60 * 60 * 24)
    );
};

// ======================================================================================
// List Value

/**
 * membuat list tahun dari terkecil sampai sekarang
 * @param {number} start_at tahun terkecil
 * @returns
 */
function listYear(start_at) {
    const now_tahun = new Date().getFullYear(),
        jarak_tahun = start_at === now_tahun ? 1 : now_tahun - start_at,
        tahun = [];
    // eslint-disable-next-line id-length
    for (let i = 0; i < jarak_tahun + 1; i++) {
        tahun.push(start_at + i);
    }
    return tahun.reverse();
}

// ======================================================================================
// Function Global

/**
 * Deep merge two objects or many level.
 * @param target
 * @param ...sources
 */
function mergeDeepObject(target, ...sources) {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                mergeDeepObject(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeepObject(target, ...sources);
}

/**
 * convert key of object to lowercase
 * @param {{}} object
 * @returns {{}}
 */
function objectKeyToLowercase(object) {
    return Object.fromEntries(
        Object.entries(object).map(([key, val]) => {
            return [key.toLowerCase(), val];
        })
    );
}

/**
 * membuat format count rupiah
 * @param {number|string} angka nominal angka
 * @param {string} prefix nama mata uang (Rp.)
 * @returns
 */
function formatRupiah(angka, prefix) {
    if (Number.isInteger(angka)) {
        // eslint-disable-next-line no-param-reassign
        angka = angka.toString();
    }
    let number_string = angka.replace(/[^,\d]/g, '').toString(),
        split = number_string.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah = rupiah + (separator + ribuan.join('.'));
    }

    rupiah = split[1] !== undefined ? `${rupiah},${split[1]}` : rupiah;
    return prefix === undefined ? rupiah : rupiah ? prefix + rupiah : '';
}

const bulan_indo = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

/**
 * mengetahui perbedaan waktu sekarang
 * @returns
 */
function pagi_siang_sore_malam() {
    let jam = new Date().getHours();
    if (jam >= 4 && jam < 10) {
        return 'pagi';
    } else if (jam >= 10 && jam < 14) {
        return 'siang';
    } else if (jam >= 14 && jam < 18) {
        return 'sore';
    }
    return 'malam';
}

/**
 *
 * @param {[]} array_awal
 * @param {function(row,resolve)} onPrebuild
 * @param {function} onResult
 * @param {function} onError
 */
function createPromise(array_awal, onPrebuild, onResult, onError) {
    let array_save = [];
    Promise.all(
        array_awal.map((rows) => {
            let promise = new Promise((resolve, reject) => {
                // and want to push it to an array
                onPrebuild(
                    rows,
                    (res) => {
                        resolve(res);
                    },
                    (rej) => {
                        reject(rej);
                    }
                );
            });
            return promise
                .then((result) => {
                    array_save.push(result); // ok
                })
                .catch((error) => {
                    onError(error);
                });
        })
    ).then(() => {
        // result
        onResult(array_save);
    });
}

/**
 * simulasi delay pada promise
 * @param {number} delay
 * @returns
 */
const simulateAsyncPause = (delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            return resolve();
        }, parseInt(delay, 10));
    });
};

/**
 * membuat group dari key yang ada didalam array (seperti group by SQL)
 * @param {[]} array
 * @param {string} key
 * @returns
 */
function arrayGroupByKey(array, key) {
    return Object.keys(
        // eslint-disable-next-line id-length
        array.reduce((r, a) => {
            r[a[key]] = r[a[key]] || [];
            r[a[key]].push(a);
            return r;
        }, Object.create(null))
    );
}

/**
 * merubah semua kata depannya besar
 * @param {string} str
 * @returns
 */
function capitalizeFirstLetter(str) {
    return (
        str
            .split(' ')
            // eslint-disable-next-line id-length
            .map((a) => {
                return a[0].toUpperCase() + a.slice(1);
            })
            .join(' ')
    );
}

/**
 * filter value hanya angka
 * @param {*} value
 * @returns
 */
function onlyNumber(value) {
    return value.replace(/(?!-)[0-9]*\.?[0-9]+/g, '');
}

/**
 * filter value hanya huruf
 * @param {*} value
 * @returns
 */
function onlyLetter(value) {
    return value.replace(/[^a-zA-Z]/g, '');
}

/**
 * filter value hanya huruf dan angka
 * @param {*} value
 * @returns
 */
function onlyLetterNumber(value) {
    return value.replace(/[^a-zA-Z][^0-9\\.]/g, '').replace(/\+/g, '');
}

/**
 * filter value hanya karakter
 * @param {*} value
 * @returns
 */
function onlyCharacter(value) {
    // eslint-disable-next-line no-useless-escape
    return value.replace(/[^`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, '');
}

/**
 * list all file and folder
 * @param {string} directoryPath
 * @param {function} onResult
 */
function listFileFromDir(directoryPath, onResult) {
    let list = [],
        file = [],
        folder = [];
    Promise.all(
        fs.readdirSync(directoryPath).map((file_folder) => {
            const promise = new Promise((resolve) => {
                const stats = fs.statSync(path.join(directoryPath, file_folder));
                resolve({
                    isDirectory: stats.isDirectory(),
                    name: path.join(directoryPath, file_folder),
                });
            });
            return promise.then((result) => {
                list.push(result); // ok
            });
        })
    ).then(() => {
        // console.log(list); // debug
        file = list
            .filter((val) => {
                if (!val.isDirectory) {
                    return true;
                }
                return false;
            })
            .map((val) => {
                return val.name;
            });
        folder = list
            .filter((val) => {
                if (val.isDirectory) {
                    return true;
                }
                return false;
            })
            .map((val) => {
                return val.name;
            });
        // result
        onResult({
            file,
            folder,
        });
    });
}

/**
 * scan all network
 * @returns
 */
function scanAllNetwork() {
    const results = Object.create(null); // Or just '{}', an empty object
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results;
}

/**
 * get local IP
 * @returns
 */
function getLocalIPAddress() {
    let interfaces = require('os').networkInterfaces();
    // eslint-disable-next-line guard-for-in
    for (let devName in interfaces) {
        let iface = interfaces[devName];

        // eslint-disable-next-line id-length
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (
                alias.family === 'IPv4' &&
                alias.address !== '127.0.0.1' &&
                alias.address.includes('192.168') &&
                !alias.internal
            ) {
                return alias.address;
            }
        }
    }
    return false;
}

/**
 * get processor ID
 * @returns {*}
 */
function getProcessorID() {
    if (platform === 'win32') {
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line no-unused-vars
            exec('wmic CPU get ProcessorId', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve(String(stdout).split('\n')[1]);
            });
        });
    } else if (platform === 'linux') {
        return false;
    } else if (platform === 'darwin') {
        return false;
    }
    return false;
}

const getIP = (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
};

// eslint-disable-next-line require-jsdoc
function fixUrl(value) {
    return `/${String(value)
        .split('/')
        // eslint-disable-next-line id-length
        .filter((v) => {
            return v !== '';
        })
        .join('/')}`;
}

/**
 *
 * @param {*} baseClass
 * @param  {...any} mixins
 * @returns
 */
const combineClass = (baseClass, ...mixins) => {
    class Base extends baseClass {
        // eslint-disable-next-line require-jsdoc
        constructor(...args) {
            super(...args);
            mixins.forEach((Mixin) => {
                // eslint-disable-next-line no-use-before-define
                copyProps(this, new Mixin());
            });
        }
    }
    let copyProps = (target, source) => {
        // this function copies all properties and symbols, filtering out some special ones
        Object.getOwnPropertyNames(source)
            .concat(Object.getOwnPropertySymbols(source))
            .forEach((prop) => {
                if (
                    !prop.match(
                        /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
                    )
                ) {
                    Object.defineProperty(
                        target,
                        prop,
                        Object.getOwnPropertyDescriptor(source, prop)
                    );
                }
            });
    };
    mixins.forEach((mixin) => {
        // outside constructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
        copyProps(Base.prototype, mixin.prototype);
        copyProps(Base, mixin);
    });
    return Base;
};

/**
 * @param {string} value
 * @returns {string}
 */
function splitCamelCase(value) {
    return String(value).replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

// eslint-disable-next-line require-jsdoc
function clearAndDebug(value) {
    console.log('\033[2J'); // clear CLI
    console.log(value);
}

/**
 * @param {[{}]} data format is array in object
 * @returns
 */
function json2array(data) {
    let headers = []
    let output = new Array(data.length + 1)
    // get object keys for first item if one exists
    if (data.length > 0) {
        headers = Object.keys(data[0])
    }
    output[0] = headers
    data.forEach((dataRow, row) => {
        const outputRow = new Array(headers.length)
        // populate array
        headers.forEach((header, column) => {
            outputRow[column] = dataRow[header]
        })
        output[row + 1] = outputRow
    })
    return output
}

/**
 * @param {[{}]} array
 * @param {string} separator
 * @returns
 */
function array2csv(array, separator = ';') {
    let csvOut = ''
    const fix_array = json2array(array)
    fix_array.forEach((arrRow, rowNum) => {
        let csvRow = ''
        arrRow.forEach((value, colNum) => {
            if (colNum > 0) {
                // eslint-disable-next-line operator-assignment
                csvRow += separator
            }
            if (typeof value === 'number') {
                // eslint-disable-next-line operator-assignment
                csvRow += value
            } else if (typeof value === 'boolean') {
                // eslint-disable-next-line operator-assignment
                csvRow += value ? 'TRUE' : 'FALSE'
                // quote strings and handle existing quotes
            } else {
                // eslint-disable-next-line operator-assignment
                csvRow += `"${String(value).replace(/"/g, '""')}"`
            }
        })
        if (rowNum > 0) {
            // eslint-disable-next-line operator-assignment
            csvOut += '\n'
        } // newline-split rows
        // eslint-disable-next-line operator-assignment
        csvOut += csvRow
    })
    return csvOut
}

function fixZeroDate(value) {
    return value < 10 ? '0' + value : value
}
function fixZeroMillisecond(value) {
    return String(value).length === 3 ? value : '0' + value
}

function mkdirIfNotExist(directory_path) {
    if (!fs.existsSync(directory_path)) {
        fs.mkdir(directory_path)
    }
}

module.exports = {
    // ============== Special Function ============== //
    // Specific Function for Jump Boot
    getHeaders,

    // validation
    isProduction,
    isObject,
    isArray,
    isString,
    isNumber,
    isEmpty,
    isOdd,
    IsJsonString,
    isEmail,

    // generator
    generateRandomInteger,
    generateRandomString,
    generateRandomOTP,
    multipleDigits,

    // search engine
    get_keywords,

    // calculate
    calculate_age,
    day_count,

    // list value
    listYear,

    mergeDeepObject,
    objectKeyToLowercase,

    formatRupiah,
    bulan_indo,
    pagi_siang_sore_malam,

    createPromise,
    simulateAsyncPause,
    arrayGroupByKey,

    capitalizeFirstLetter,
    onlyNumber,
    onlyLetter,
    onlyCharacter,
    onlyLetterNumber,

    listFileFromDir,

    scanAllNetwork,
    getLocalIPAddress,
    getProcessorID,

    getIP,
    fixUrl,

    combineClass,
    splitCamelCase,

    clearAndDebug,

    json2array,
    array2csv,

    fixZeroDate,
    fixZeroMillisecond,

    mkdirIfNotExist,
};
