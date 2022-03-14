/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk membuat setter getter secara otomatis
 */

class Lombok {
    // eslint-disable-next-line require-jsdoc
    #createNameFunction(setOrGet, string) {
        return setOrGet + string.charAt(0).toUpperCase() + string.slice(1);
    }

    // eslint-disable-next-line require-jsdoc
    setupGetterSetter() {
        const keys = Object.keys(this);
        keys.forEach((key) => {
            // set all null if undefined
            if (this[key] === undefined) {
                this[key] = null;
            }

            /**
       * Setter
       * @param {*} value set value before send
       */
            this[this.#createNameFunction('set', key)] = (value) => {
                this[key] = value;
            };

            /**
       * Getter
       * @returns
       */
            this[this.#createNameFunction('get', key)] = () => {
                return this[key];
            };
        });

        /**
     * Sending DTO Format
     * @param {{}} res from controller express
     * @returns
     */
        // eslint-disable-next-line consistent-return
        this.send = (res = false) => {
            const send = {};
            keys.forEach((key) => {
                send[key] = this[key];
            });
            if (res) {
                res.status(200).json(send);
            } else {
                return send;
            }
        };
    }
}

module.exports = Lombok;
