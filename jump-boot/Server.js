/**
 * Author      : Jefri Herdi Triyanto
 * Description : untuk membuat webserver secara OOP
 */

const path = require('path');

// files and folders management
const {
    existsSync,
    readdirSync,
    mkdirSync,
    rmSync,
    writeFileSync,
    unlinkSync,
    readFileSync,
} = require('fs');
const { emptyDirSync } = require('fs-extra');

// ZIP helpers
const extract = require('extract-zip');

// ORM
const typeorm = require('typeorm'); // More : https://orkhan.gitbook.io/typeorm/docs/connection-options#connection-options-example

// webserver
const express = require('express');
const fileUpload = require('express-fileupload');
const http = require('http');
const morgan = require('morgan'); // for debug

// security
const { JwtValidate } = require('./Jwt');

// Middleware Extras
const { urlencoded, json } = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

// JUMP-BOOT items
const properties = require('./properties');
const { StatusCode } = require('./Enum');
const { isArray, isObject, isString, isEmail, fixUrl } = require('./Helpers');
const { log, message } = require('./Styles');
const { randomHEX } = require('./encryption');

class Server {
    // eslint-disable-next-line require-jsdoc
    resetRun() {
        log.restart('SYSTEM', 'please re-run services...');
        process.exit(1);
    }

    /**
   * @param {*} param0
   */
    constructor({
        port = 5000,
        host = '0.0.0.0',
        debug = false,
        public_directory = false,
        // eslint-disable-next-line no-shadow
        urlencoded = false,
        // eslint-disable-next-line no-shadow
        json = false,
        // eslint-disable-next-line no-shadow
        cors = false,
        // eslint-disable-next-line no-shadow
        helmet = false,
        maxUploadSize = 20,
        // eslint-disable-next-line no-shadow
        jwt = false,
        doc = false,
    }) {
        const path_env = path.join(__dirname, '..', '.env');

        // webserver init
        this.app = express();

        this.port = properties.server.port || port;
        this.host = host;

        // for developing
        this.debug = debug;
        if (debug) {
            this.app.use(morgan('dev'));
        }

        if (public_directory) {
            const public_dir = path.join(__dirname, '..', 'public');
            if (!existsSync(public_dir)) {
                mkdirSync(public_dir);
            }
            this.app.use(express.static(public_dir));
        }

        this.urlencoded = urlencoded;
        this.json = json;
        this.cors = cors;
        this.helmet = helmet;
        this.maxUploadSize = maxUploadSize;
        this.jwt = jwt;
        if (this.jwt && !process.env.JWT_TOKEN) {
            const random_token = randomHEX(typeof jwt === 'number' ? this.jwt : 20);
            const random_refresh_token = randomHEX(
                typeof jwt === 'number' ? this.jwt : 20
            );
            const keys_token = `JWT_TOKEN=${random_token}\nJWT_REFRESH_TOKEN=${random_refresh_token}\n`;
            // eslint-disable-next-line require-jsdoc
            if (!existsSync(path_env)) {
                writeFileSync(path_env, keys_token, {
                    encoding: 'utf-8',
                });
                this.resetRun();
            } else {
                const last_env = readFileSync(path_env, { encoding: 'utf-8' });
                if (
                    !['JWT_TOKEN', 'JWT_REFRESH_TOKEN'].some((v) => {
                        return last_env.includes(v);
                    })
                ) {
                    writeFileSync(path_env, `${last_env}\n\n${keys_token}`, {
                        encoding: 'utf-8',
                    });
                    this.resetRun();
                }
            }
        }
        this.doc = doc;
    }

    saveDoc = [];

    initDatabase = async () => {
        try {
            if (
                properties.db !== undefined &&
                properties.spring.datasource !== undefined
            ) {
                if (!existsSync(path.join(__dirname, '..', 'models'))) {
                    mkdirSync(path.join(__dirname, '..', 'models'));
                }
                if (!existsSync(path.join(__dirname, '..', 'models', 'entities'))) {
                    mkdirSync(path.join(__dirname, '..', 'models', 'entities'));
                }
                if (!existsSync(path.join(__dirname, '..', 'models', 'repository'))) {
                    mkdirSync(path.join(__dirname, '..', 'models', 'repository'));
                }
                if (!existsSync(path.join(__dirname, '..', 'models', 'migration'))) {
                    mkdirSync(path.join(__dirname, '..', 'models', 'migration'));
                }
                const entities = [];
                readdirSync(path.join(__dirname, '..', 'models', 'entities')).forEach(
                    (entity) => {
                        entities.push(
                            require(path.join(__dirname, '..', 'models', 'entities', entity))
                        );
                    }
                );
                // select framework
                const framework =
                    properties.spring !== undefined ?
                        'spring' :
                        properties.jump !== undefined ?
                            'jump' :
                            'spring';
                let type =
                    properties[framework] !== undefined ?
                        properties[framework].datasource.url :
                        'aaa:mysql:bbb'; // default mysql
                type = String(type).split(':')[1];
                type =
                    type === 'mysql' ?
                        'mysql' :
                        type === 'postgresql' ?
                            'postgres' :
                            type === 'oci8' ?
                                'oracle' :
                                'mysql'; // default
                const synchronize =
                    properties.spring.jpa.hibernate['ddl-auto'] === 'auto';
                const logging = String(properties.spring?.jpa['show-sql'] ? properties.spring?.jpa['show-sql'] :
                    properties.jumpboot?.jpa['show-sql'] ? properties.jumpboot?.jpa['show-sql'] :
                        properties['jump-boot']?.jpa['show-sql'] ? properties['jump-boot']?.jpa['show-sql'] : false).toLowerCase() === 'true'
                const connection = await typeorm
                    .createConnection({
                        name: 'default',
                        type,
                        host: properties.db.host,
                        port: properties.db.port,
                        username: properties.spring.datasource.username,
                        password: properties.spring.datasource.password,
                        database: properties.db.name,
                        synchronize,
                        logging, // debug query
                        entities,
                    })
                    .then((connect) => {
                        log.running(
                            'typeorm',
                            `Database is connected! (${properties.db.name}) (${type})`
                        );
                        return connect;
                    })
                    .catch((error) => {
                        log.error('typeorm', `Error connection: ${error.message}`);
                        process.exit(1);
                        // return error
                    });
                this.app.use((req, res, next) => {
                    req.database = connection;
                    next();
                });
                global.connection = connection;
                return connection;
            }
            console.log('no database configuration!');
            return null;
        } catch (err) {
            throw new Error(err);
        }
    };

    important_directories = {
        controllers: 'controllers',
        middlewares: 'middlewares',
        services: 'services',
    };

    // eslint-disable-next-line require-jsdoc
    loadControllers = async () => {
        const path_middleware = path.join(
            __dirname,
            '..',
            this.important_directories.middlewares
        );
        const listAllRoutes = [];

        // fix configure
        this.app.use(urlencoded({ extended: false }));
        this.app.use(json());

        // set the view engine to ejs
        this.app.set('view engine', 'ejs');

        // add configure
        if (this.cors) {
            this.app.use(cors({ credentials: true, origin: true }));
        }
        if (this.helmet) {
            this.app.use(helmet());
        }

        // check if the important directories already exist?
        Object.values(this.important_directories).forEach((id) => {
            if (!existsSync(path.join(__dirname, '..', id))) {
                mkdirSync(path.join(__dirname, '..', id));
            }
        });

        // enable files upload
        this.app.use(
            fileUpload({
                createParentPath: true,
                limits: {
                    fileSize: this.maxUploadSize * 1024 * 1024 * 1024, // 20MB max file(s) size (default)
                },
            })
        );

        // add all controller to webserver with annotation
        require('./Annotation')(this.important_directories).forEach(
            (controller) => {
                // eslint-disable-next-line no-shadow
                const { _pathFile, name, globalAnnotations, methods } = controller;
                const { Skip, Path } = globalAnnotations;
                if (!Skip) {
                    if (Path) {
                        // show
                        const route = {};
                        route.file_name = name;
                        route.methods = [];
                        const Controller = require(_pathFile);
                        const NewController = new Controller();
                        methods.forEach((method) => {
                            const { function_name, annotations } = method;
                            // console.log({ annotations }); // debug
                            const middleware = []; // jika nggak ada middleware ya kosong nggak pa2 soalnya ini harus global
                            // eslint-disable-next-line require-jsdoc
                            function addMiddleware(add_middleware) {
                                const new_middleware = path.join(
                                    path_middleware,
                                    `${add_middleware}.js`
                                );
                                if (existsSync(new_middleware)) {
                                    middleware.push(require(new_middleware));
                                } else {
                                    throw new Error(
                                        `middleware "${add_middleware}.js" ` +
                                        `not found!, proof : ${new_middleware}`
                                    );
                                }
                            }
                            // =================== JSON Web Token =================== //
                            const JwtGlobal = globalAnnotations.Jwt;
                            const JwtLocal = annotations.Jwt;
                            // console.log({ JwtGlobal, JwtLocal }); // debug (don't delete this)
                            if (this.jwt && JwtGlobal) {
                                middleware.push(JwtValidate);
                            } else if (this.jwt && !JwtGlobal && JwtLocal) {
                                middleware.push(JwtValidate);
                            }
                            // =================== Allowed Header =================== //
                            if (annotations.AllowHeader) {
                                middleware.push((req, res, next) => {
                                    let headers_available = [];
                                    if (isArray(annotations.AllowHeader)) {
                                        headers_available = annotations.AllowHeader;
                                    } else {
                                        headers_available.push(annotations.AllowHeader);
                                    }
                                    const list_headers = Object.values(
                                        headers_available.reduce((simpan, key) => {
                                            return {
                                                ...simpan,
                                                [key]: req.headers[key] !== undefined,
                                            };
                                        }, {})
                                    );
                                    if (list_headers.includes(false)) {
                                        res.status(StatusCode.CLIENT.BAD_REQUEST).json({
                                            message: `headers '${headers_available.join(
                                                ' / '
                                            )}' is required!`,
                                        });
                                    } else {
                                        // eslint-disable-next-line callback-return
                                        next();
                                    }
                                });
                            }

                            // ==================== Validate Body ==================== //
                            // eslint-disable-next-line require-jsdoc
                            function validateType(type, value) {

                                /**
                 *
                 * @param {array} approve
                 * @returns
                 */
                                function approved(approve) {
                                    return (
                                        String(type)
                                            .split('|')
                                            // eslint-disable-next-line id-length
                                            .some((r) => {
                                                return approve.includes(r);
                                            })
                                    );
                                }
                                // validate type of value
                                if (
                                    approved(['int', 'integer', 'number']) &&
                                    typeof value === 'number'
                                ) {
                                    return true;
                                }
                                if (approved(['str', 'string']) && typeof value === 'string') {
                                    return true;
                                }
                                if (
                                    approved(['bool', 'boolean']) &&
                                    typeof value === 'boolean'
                                ) {
                                    return true;
                                }
                                if (approved(['array']) && isArray(value)) {
                                    return true;
                                }
                                if (approved(['obj', 'object']) && isObject(value)) {
                                    return true;
                                }
                                return false; // tolak
                            }
                            // eslint-disable-next-line require-jsdoc
                            function validateFunction(type, value) {

                                /**
                 * @param {array} approve
                 * @returns
                 */
                                function approved(approve) {
                                    return (
                                        String(type)
                                            .split('|')
                                            // eslint-disable-next-line id-length
                                            .some((r) => {
                                                return approve.includes(r);
                                            })
                                    );
                                }
                                // console.log({ value, isEmail: isEmail(value), isArray: isArray(value) }); // debug
                                // validate function
                                if (approved(['email'])) {
                                    if (approved(['array']) && isArray(value)) {
                                        // eslint-disable-next-line arrow-body-style
                                        return (
                                            value.map((v) => {
                                                return isEmail(v)
                                            }).filter((v) => {
                                                return v
                                            }).length === 0
                                        );
                                    } else if (isEmail(value)) {
                                        return false; // ok kebalikan
                                    }
                                }
                                return false; // tolak
                            }
                            if (annotations.ValidateBody) {
                                if (isObject(annotations.ValidateBody)) {
                                    if (
                                        // eslint-disable-next-line id-length
                                        ['PostMapping', 'PutMapping', 'DeleteMapping'].some((v) => {
                                            return annotations[v];
                                        })
                                    ) {
                                        const keys = Object.keys(annotations.ValidateBody);
                                        middleware.push((req, res, next) => {
                                            const list_body = Object.values(
                                                keys.reduce((simpan, key) => {
                                                    return {
                                                        ...simpan,
                                                        [key]: req.body[key] !== undefined,
                                                    };
                                                }, {})
                                            );
                                            if (list_body.includes(false)) {
                                                res.status(StatusCode.CLIENT.BAD_REQUEST).json({
                                                    message: `body '${keys.join(' / ')}' is required!`,
                                                });
                                            } else {
                                                // add validate
                                                const validate = [];
                                                keys.forEach((key) => {
                                                    if (
                                                        validateFunction(
                                                            annotations.ValidateBody[key],
                                                            req.body[key]
                                                        )
                                                    ) {
                                                        validate.push(undefined);
                                                    } else {
                                                        // eslint-disable-next-line no-lonely-if
                                                        if (
                                                            validateType(
                                                                annotations.ValidateBody[key],
                                                                req.body[key]
                                                            )
                                                        ) {
                                                            validate.push(true);
                                                        } else {
                                                            validate.push(false);
                                                        }
                                                    }
                                                });
                                                // console.log({ validate });
                                                if (validate.includes(undefined)) {
                                                    res.status(StatusCode.CLIENT.BAD_REQUEST).json({
                                                        message: `validate '${keys.join(
                                                            ' / '
                                                        )}' is not allowed!`,
                                                    });
                                                } else {
                                                    // eslint-disable-next-line no-lonely-if
                                                    if (validate.includes(false)) {
                                                        res.status(StatusCode.CLIENT.BAD_REQUEST).json({
                                                            message: `type '${keys.join(
                                                                ' / '
                                                            )}' is not allowed!`,
                                                        });
                                                    } else {
                                                        // eslint-disable-next-line callback-return
                                                        next();
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        console.log(
                                            // eslint-disable-next-line max-len
                                            `\n\n[ERROR]\nGET method is not support ValidateBody, \n\tproof file  : ${_pathFile}\n\ton function : ${function_name}\n\tremove this : @ValidateBody (`,
                                            annotations.ValidateBody,
                                            ')\n\n\n'
                                        );
                                        throw new Error('read error please...');
                                    }
                                } else {
                                    throw new Error('@ValidateBody is not object...');
                                }
                            } else {
                                // ==================== Allowed Body ==================== //
                                // eslint-disable-next-line no-lonely-if
                                if (annotations.AllowBody) {
                                    // input paling depan dari semua middleware
                                    if (
                                        // eslint-disable-next-line id-length
                                        ['PostMapping', 'PutMapping', 'DeleteMapping'].some((v) => {
                                            return annotations[v];
                                        })
                                    ) {
                                        middleware.push((req, res, next) => {
                                            let body_available = [];
                                            if (isArray(annotations.AllowBody)) {
                                                body_available = annotations.AllowBody;
                                            } else {
                                                body_available.push(annotations.AllowBody);
                                            }
                                            const list_body = Object.values(
                                                body_available.reduce((simpan, key) => {
                                                    return {
                                                        ...simpan,
                                                        [key]: req.body[key] !== undefined,
                                                    };
                                                }, {})
                                            );
                                            if (list_body.includes(false)) {
                                                res.status(StatusCode.CLIENT.BAD_REQUEST).json({
                                                    message: `body '${body_available.join(
                                                        ' / '
                                                    )}' is required!`,
                                                });
                                            } else {
                                                // eslint-disable-next-line callback-return
                                                next();
                                            }
                                        });
                                    } else {
                                        console.log(
                                            // eslint-disable-next-line max-len
                                            `\n\n[ERROR]\nGET method is not support AllowBody, \n\tproof file  : ${_pathFile}\n\ton function : ${function_name}\n\tremove this : @AllowBody =`,
                                            annotations.AllowBody,
                                            '\n\n\n'
                                        );
                                        throw new Error('read error please...');
                                    }
                                }
                            }
                            // ==================== Middleware ==================== //
                            if (annotations.Middleware) {
                                // if add middleware
                                if (isArray(annotations.Middleware)) {
                                    // eslint-disable-next-line no-shadow
                                    annotations.Middleware.forEach((middleware) => {
                                        addMiddleware(middleware);
                                    });
                                } else if (isString(annotations.Middleware)) {
                                    addMiddleware(annotations.Middleware);
                                }
                            }
                            // ==================== Routes ==================== //
                            const fix_url =
                                properties?.server?.servlet['context-path'] &&
                                    typeof properties?.server?.servlet['context-path'] === 'string' ?
                                    fixUrl(
                                        fixUrl(properties.server.servlet['context-path']) +
                                        fixUrl(Path)
                                    ) :
                                    fixUrl(Path);
                            let url = '';
                            let this_method = '';
                            if (annotations.AllMapping) {
                                url = fix_url + fixUrl('*');
                                this_method = 'all'
                                this.app.all(url, ...middleware, NewController[function_name]);
                            } else if (annotations.GetMapping) {
                                url = fix_url + fixUrl(annotations.GetMapping);
                                this_method = 'get'
                                this.app.get(url, ...middleware, NewController[function_name]);
                            } else if (annotations.PostMapping) {
                                url = fix_url + fixUrl(annotations.PostMapping);
                                this_method = 'post'
                                this.app.post(url, ...middleware, NewController[function_name]);
                            } else if (annotations.PutMapping) {
                                url = fix_url + fixUrl(annotations.PutMapping);
                                this_method = 'put'
                                this.app.put(url, ...middleware, NewController[function_name]);
                            } else if (annotations.DeleteMapping) {
                                url = fix_url + fixUrl(annotations.DeleteMapping);
                                this_method = 'delete'
                                this.app.delete(
                                    url,
                                    ...middleware,
                                    NewController[function_name]
                                );
                            } else if (annotations.PatchMapping) {
                                url = fix_url + fixUrl(annotations.PatchMapping);
                                this_method = 'patch'
                                this.app.patch(
                                    url,
                                    ...middleware,
                                    NewController[function_name]
                                );
                            } else if (annotations.OptionsMapping) {
                                url = fix_url + fixUrl(annotations.OptionsMapping);
                                this_method = 'options'
                                this.app.options(
                                    url,
                                    ...middleware,
                                    NewController[function_name]
                                );
                            } else if (annotations.HeadMapping) {
                                url = fix_url + fixUrl(annotations.HeadMapping);
                                this_method = 'head'
                                this.app.head(url, ...middleware, NewController[function_name]);
                            }
                            const {
                                TestPositive, TestNegative,
                                //
                                Doc,
                                //
                                DocHeaders, DocHeadersDesc,
                                //
                                DocQuery, DocQueryDesc,
                                DocParams, DocParamsDesc,
                                DocBody, DocBodyDesc,
                            } = annotations
                            // console.log({ annotations, globalAnnotations }); // debug
                            const all_response = Object.keys(annotations)
                                // eslint-disable-next-line arrow-body-style
                                .filter(v => String(v).toLowerCase().startsWith('doc'))
                                // eslint-disable-next-line arrow-body-style
                                .filter(v => ![ // selain ini adalah kode response
                                    'Doc',
                                    'DocQuery', 'DocQueryDesc',
                                    'DocParams', 'DocParamsDesc',
                                    'DocBody', 'DocBodyDesc',
                                    'DocHeaders', 'DocHeadersDesc',
                                    // eslint-disable-next-line arrow-body-style
                                ].some(a => v === a))
                                // eslint-disable-next-line arrow-body-style
                                .map(v => String(v).toLowerCase().replace('doc', ''))
                                .reduce((simpan, key) => {
                                    simpan[key] = annotations[`Doc${key}`]
                                    return simpan
                                }, {})
                            // console.log({
                            //     // annotations,
                            //     all_response,
                            // });
                            route.methods.push({
                                function_name,
                                url,
                                method: this_method,
                                documentation: {
                                    description: Doc,
                                    //
                                    query: DocQuery, // get
                                    queryDesc: DocQueryDesc,
                                    parameters: DocParams, // get, post, put, delete
                                    parametersDesc: DocParamsDesc,
                                    body: DocBody, // post, put, delete
                                    bodyDesc: DocBodyDesc,
                                    //
                                    headers: DocHeaders,
                                    headersDesc: DocHeadersDesc,
                                    //
                                    ...all_response,
                                },
                            });
                        });
                        listAllRoutes.push(route);
                    } else {
                        throw new Error(`please use @Path annotation on ${name}.js\n\n`);
                    }
                }
            }
        );
        // documentation here...
        if (this.doc) {
            // console.log({ routes: listAllRoutes }); // debug
            // documentation
            this.app.get('/doc', (req, res) => {
                return res.sendFile(path.join(__dirname, 'web', 'documentation', 'index.html'))
            });
            this.app.get('/doc/:file_name', (req, res, next) => {
                const target = path.join(__dirname, 'web', 'documentation', req.params.file_name)
                if (existsSync(target)) {
                    return res.sendFile(target)
                }
                return next()
            });
            // helper
            this.app.get('/doc/helper', (req, res) => {
                return res.sendFile(path.join(__dirname, 'web', 'helper', 'index.html'))
            });
            this.app.get('/doc/helper/:file_name', (req, res, next) => {
                const target = path.join(__dirname, 'web', 'helper', req.params.file_name)
                if (existsSync(target)) {
                    return res.sendFile(target)
                }
                return next()
            });
            // get raw data
            this.app.get('/doc/data', (req, res) => {
                // package information
                const package_json = require('../package.json')
                delete package_json['lint-staged'] // type
                delete package_json.repository
                // eslint-disable-next-line no-underscore-dangle
                delete package_json._moduleAliases
                delete package_json.dependencies
                delete package_json.devDependencies
                delete package_json.main
                delete package_json.scripts
                delete package_json.type
                return res.status(StatusCode.SUCCESS.OK).json({
                    routes: listAllRoutes,
                    ...package_json,
                })
            });
        }
        return listAllRoutes;
    }

    // eslint-disable-next-line require-jsdoc
    run = async () => {
        return {
            httpServer: http
                .createServer(this.app)
                .listen(this.port, this.host, async () => {
                    log.running(
                        'express',
                        `The server is running on port http://localhost:${this.port}`
                    );
                }),
            app: this.app,
        };
    }

    // eslint-disable-next-line require-jsdoc
    renderClient() {
        // path init
        const html_in_public = path.join(__dirname, '..', 'public', 'index.html');
        const pathJsFramework = path.join(__dirname, '..', 'js-framework');

        // public folder
        if (existsSync(html_in_public)) {
            console.log('hapus html di dalam folder public...');
            rmSync(html_in_public);
        }
        this.app.use(express.static(html_in_public));

        // RFP
        if (!existsSync(pathJsFramework)) {
            mkdirSync(pathJsFramework);
        }
        this.app.use(express.static(pathJsFramework));
        const rfp = randomHEX(20);
        writeFileSync(path.join(__dirname, '..', '.rfp'), rfp, {
            encoding: 'utf-8',
        });
        message.variable('RFP', rfp, true);
        // eslint-disable-next-line consistent-return
        this.app.put('/', async (req, res) => {
            try {
                if (req.headers.password === rfp) {
                    if (!req.files) {
                        return res.send({
                            status: false,
                            message: 'No file uploaded',
                        });
                    }
                    // Use the name of the input field (i.e. "files") to retrieve the uploaded file
                    const { name, mv } = req.files.zip_file;
                    const zip_save = path.join(pathJsFramework, name);
                    await emptyDirSync(pathJsFramework);
                    console.log('Empty Directory complete');
                    await mv(zip_save);
                    console.log('Save ZIP complete');
                    await extract(zip_save, { dir: pathJsFramework });
                    console.log('Extraction complete');
                    await unlinkSync(zip_save);
                    console.log('Delete ZIP complete');
                    return res.status(StatusCode.SUCCESS.OK).json({
                        success: true,
                        message: 'frontend sudah diperbarui',
                    });
                }
                return res.status(StatusCode.CLIENT.UNAUTHORIZED).json({
                    success: false,
                    message: 'password salah...',
                });
            } catch (err) {
                res.status(StatusCode.SERVER.INTERNAL_SERVER_ERROR).send(err.message);
            }
        });
    }
}

module.exports = Server;
