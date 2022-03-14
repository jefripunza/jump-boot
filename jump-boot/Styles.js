/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk memperindah CLI message
 */

const chalk = require('chalk');

module.exports = {
    message: {

        /**
     *
     * @param {string} key
     * @param {*} value
     * @param {boolean} margin
     */
        variable: (key, value, margin = false) => {
            // eslint-disable-next-line no-unused-expressions
            margin && console.log('');
            console.log(`${chalk.bold.green(key)}\t: ${value}`);
            // eslint-disable-next-line no-unused-expressions
            margin && console.log('');
        },

        /**
     *
     * @param {string} text
     */
        success: (text) => {
            console.log(chalk.bold.green(text));
        },

        /**
     *
     * @param {string} text
     */
        error: (text) => {
            console.log(chalk.bold.red(text));
        },
    },
    log: {

        /**
     *
     * @param {string} app_name
     * @param {string} text
     */
        running: (app_name, text) => {
            console.log(
                `${chalk.bold.magenta(`[${app_name}]`)}\t${chalk.bold.green(
                    'RUNNING'
                )}\t: ${text}`
            );
        },

        /**
     *
     * @param {string} app_name
     * @param {string} text
     */
        warning: (app_name, text) => {
            console.log(
                `${chalk.bold.magenta(`[${app_name}]`)}\t${chalk.bold.yellow(
                    'WARNING'
                )}\t: ${chalk.green(text)}`
            );
        },

        /**
     *
     * @param {string} app_name
     * @param {string} text
     */
        restart: (app_name, text) => {
            console.log(
                `${chalk.bold.magenta(`[${app_name}]`)}\t${chalk.bold.yellow(
                    'RESTART'
                )}\t: ${chalk.green(text)}`
            );
        },

        /**
     *
     * @param {string} app_name
     * @param {string} text
     */
        error: (app_name, text) => {
            console.log(
                `${chalk.bold.magenta(`[${app_name}]`)}\t${chalk.bold.red(
                    'ERROR'
                )}\t: ${chalk.red(text)}`
            );
        },

        /**
     *
     * @param {string} app_name
     * @param {string} text
     */
        authenticate: (app_name, text) => {
            console.log(
                `${chalk.bold.magenta(`[${app_name}]`)}\t${chalk.bold.green(
                    'AUTH'
                )}\t: ${chalk.green(text)}`
            );
        },

        /**
     *
     * @param {string} app_name
     * @param {string} text
     */
        not_authenticate: (app_name, text) => {
            console.log(
                `${chalk.bold.magenta(`[${app_name}]`)}\t${chalk.bold.red(
                    'AUTH'
                )}\t: ${chalk.yellow(text)}`
            );
        },
    },
};
