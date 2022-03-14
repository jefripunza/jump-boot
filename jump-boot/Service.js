/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk mempermudah kebutuhan service
 */

const Jwt = require('./Jwt');

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
