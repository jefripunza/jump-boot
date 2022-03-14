/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk membaca file environment berbasis ".properties"
 */

const path = require('path');
const fs = require('fs');

/**
 * @param {*} target select class
 * @returns {*}
 */
function propertiesReader(target) {
    return fs
        .readFileSync(target, { encoding: 'utf-8' })
        .split('\n')
        .reduce((simpan, item) => {
            const [key, value] = String(item).split('=');
            return String(key).startsWith('#') || String(key).length === 0 ?
                { ...simpan } :
                {
                    ...simpan,
                    [key]: value,
                };
        }, {});
}

const { mergeDeepObject } = require('./Helpers');

const root = path.join(__dirname, '..'); // atur direktori penyimpanan file ".properties"
const default_env = 'dev'; // reason : local bisa hit dev, and dev pasti konsumsi dev

let properties_env = fs.existsSync(path.join(root, 'application.properties')) ?
    propertiesReader(path.join(root, 'application.properties'))[
        'spring.profiles.active'
    ] :
    default_env; // default if "application.properties" not found
process.env.application = properties_env; // setup env
const properties_available = fs
    .readdirSync(path.join(root))
// eslint-disable-next-line id-length
    .filter((v) => {
        return String(v).endsWith('.properties') && String(v).includes('-');
    })
// eslint-disable-next-line id-length
    .map((v) => {
        return String(v).split('-')[1].split('.')[0];
    });
// eslint-disable-next-line id-length
properties_env = properties_available.some((v) => {
    return v === properties_env;
}) ?
    properties_env :
    default_env;

const properties = propertiesReader(
    path.join(root, `application-${properties_env}.properties`),
    'utf-8',
    { allowDuplicateSections: true }
);
const properties_object = properties;
const key_list = Object.keys(properties_object);
const properties_fix = key_list.reduce((obj, key) => {
    let new_obj = obj;
    let value = properties_object[key];
    key_list.forEach((key_replace) => {
        value = String(value)
            .replace(key_replace, properties_object[key_replace])
            .replace(/\$/gi, '')
            .replace(/\{/gi, '')
            .replace(/\}/gi, '');
    });
    let save = {};
    String(key)
        .split('.')
    // eslint-disable-next-line id-length
        .reduce((r, e, i, a) => {
            // eslint-disable-next-line no-return-assign
            return a.length - 1 === i ? r[e] = value : r[e] = {};
        }, save);
    new_obj = mergeDeepObject(new_obj, save);
    return new_obj;
}, {});

module.exports = properties_available.length > 0 ? properties_fix : {};
