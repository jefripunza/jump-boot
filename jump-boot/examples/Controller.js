/**
 * title_example
 * Description :
 * Author      :
 */

const Controller = require('../jump-boot/Controller');

/**
 * @Path ("/#example#")
 */
class _Example_ extends Controller {

    /**
   * @TODO: Happy Hacking with this example ^.^
   */
    constructor() {
        super(); // please don't delete this
    }

    /**
   * @GetMapping ("/")
   * @Middleware ("")
   */
    getAllExample = async (req, res) => {
    // eslint-disable-next-line no-empty-pattern
        const {
            // declare if you use params
        } = req.params; // example: http://contoh.com/:test ~> http://contoh.com/123

        // eslint-disable-next-line no-empty-pattern
        const {
            // declare if you use query
        } = req.query; // example: http://contoh.com?id=1

        try {
            // === native ===
            // res.json({
            //     success: true,
            //     message: "this is example get method",
            // })

            // === or ===
            super.sendSuccessJson(res, {
                success: true,
                message: 'this is example get method',
            });
        } catch (error) {
            super.sendServerErrorJson(res, error.message);
        }
    };

    /**
   * @PostMapping ("/")
   * @Middleware ("")
   * @AllowHeader (["authentication"])
   * @ValidateBody ({id: "integer", username: "string", password: "string", test: "object"})
   */
    insertNewExample = async (req, res) => {
    // eslint-disable-next-line no-empty-pattern
        const {
            // declare if you use body ...
        } = req.body;

        try {
            super.sendSuccessJson(res, {
                success: true,
                message: 'this is example post method',
            });
        } catch (error) {
            super.sendServerErrorJson(res, error.message);
        }
    };

    /**
   * @PutMapping ("/")
   * @AllowBody (["id", "username", "password"])
   */
    updateExample = async (req, res) => {
    // eslint-disable-next-line no-empty-pattern
        const {
            // declare if you use body ...
        } = req.body;

        try {
            super.sendSuccessJson(res, {
                success: true,
                message: 'this is example put method',
            });
        } catch (error) {
            super.sendServerErrorJson(res, error.message);
        }
    };

    /**
   * @DeleteMapping ("/")
   * @AllowBody ("id")
   */
    deleteExample = async (req, res) => {
    // eslint-disable-next-line no-empty-pattern
        const {
            // declare if you use body ...
        } = req.body;

        try {
            super.sendSuccessJson(res, {
                success: true,
                message: 'this is example delete method',
            });
        } catch (error) {
            super.sendServerErrorJson(res, error.message);
        }
    };
}

module.exports = _Example_;
