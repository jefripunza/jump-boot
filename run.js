#!/usr/bin/env node
console.log('\033[2J'); // clear CLI
console.log('\x1b[0m'); // reset color

const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const chalk = require('chalk');
const figlet = require('figlet');

let showHelp = false; // only 1 help can view

// =============================================================================== //

const { capitalizeFirstLetter, splitCamelCase } = require('./jump-boot');

/**
 * @param {string} source path of sources
 * @param {string} target path of target
 */
function copyFile(source, target, to) {
    let class_name = path.basename(target);
    class_name = String(class_name).includes('.') ?
        String(class_name).split('.')[0] :
        class_name;
    // eslint-disable-next-line arrow-body-style
    const with_embel2 = to === 'middleware' ? 'Middleware' :
        to === 'controller' ? 'Controller' :
            to === 'service' ? 'Service' :
                to === 'repository' ? 'Repository' :
                    to === 'entities' ? 'Entity' : null
    class_name = String(class_name).toLowerCase().endsWith('controller') ? String(class_name).replace(/Controller/g, '').replace(/controller/g, '') : class_name
    const file = String(fs.readFileSync(source, { encoding: 'utf-8' }))
        .replace(/example_title/gi, splitCamelCase(class_name + with_embel2)) // title name dengan embel2
        .replace(/ExampleClass/gi, class_name + with_embel2) // untuk nama class dengan embel2
        .replace(/example_path/gi, splitCamelCase(class_name).toLowerCase().split(' ').join('_')) // untuk path endpoint
        .replace(/example_function/gi, splitCamelCase(class_name).split(' ').join('')) // untuk semua fungsional

        .replace(/ExampleSelector/gi, class_name + with_embel2) // untuk nama selector entity
        .replace(/example_tablename/gi, splitCamelCase(class_name).toLowerCase().split(' ').join('_')) // untuk nama tabel
    // eslint-disable-next-line arrow-body-style
    const fix_target = `${String(target).split('\\').reverse().map((v, i) => i === 0 ? class_name + with_embel2 : v).reverse().join('\\')}.js`
    fs.writeFileSync(fix_target, file, { encoding: 'utf-8' });
}

/**
 *
 * @param {string} cmd your command to execute
 * @param {string} dirname path your app
 * @returns {*}
 */
function execute(cmd, dirname = __dirname) {
    return new Promise((resolve, reject) => {
        child_process
            .exec(
                cmd,
                {
                    cwd: dirname,
                },
                // eslint-disable-next-line no-unused-vars
                (error, stdout, stderr) => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        resolve(stdout);
                    }
                }
            )
            .stdout.pipe(process.stdout);
    });
}

// =============================================================================== //

const source_path = {
    controller: path.join(__dirname, 'jump-boot', 'examples', 'Controller.js'),
    middleware: path.join(__dirname, 'jump-boot', 'examples', 'Middleware.js'),
    service: path.join(__dirname, 'jump-boot', 'examples', 'Service.js'),
    entities: path.join(__dirname, 'jump-boot', 'examples', 'Entity.js'),
    repository: path.join(__dirname, 'jump-boot', 'examples', 'Repo.js'),
};

const target_path = {
    controller: (name) => {
        return path.join(__dirname, 'controllers', `${name}.js`);
    },
    middleware: (name) => {
        return path.join(__dirname, 'middlewares', `${name}.js`);
    },
    service: (name) => {
        return path.join(__dirname, 'services', `${name}.js`);
    },
    entities: (name) => {
        return path.join(__dirname, 'models', 'entities', `${name}.js`);
    },
    repository: (name) => {
        return path.join(__dirname, 'models', 'repository', `${name}.js`);
    },
};

// ================================== FUNCTION ================================== //

/**
 * @param {*} argv argv
 * @param {number} numRequired select level argument
 * @returns {[]}
 */
function lastArgument(argv, numRequired) {
    // eslint-disable-next-line id-length
    const kill_urutan = Array.from({ length: numRequired - 1 }, (v, k) => {
        return k + 1;
        // eslint-disable-next-line id-length
    }).map((v) => {
        return v - 1;
    });
    // eslint-disable-next-line id-length
    return argv._.filter((v, i) => {
        return !kill_urutan.includes(i);
    })[0];
}

/**
 * @param {string} message send your message
 */
function printError(message) {
    console.log(`\n\n${chalk.bold.redBright(message)}`);
}

/**
 * @param {*} yargs ok
 * @param {*} argv ok
 * @param {*} numRequired ok
 */
function checkCommands(yargs, argv, numRequired) {
    if (argv._.length < numRequired) {
        if (!showHelp) {
            yargs.showHelp();
            showHelp = true;
            // console.log({ a: argv._.length, numRequired });
        }
    } else {
        // check for unknown command
        const kill_argv = lastArgument(argv, numRequired);
        if (argv._.length !== numRequired) {
            if (!showHelp) {
                printError(`command "${kill_argv}" not found!\n`);
                yargs.showHelp();
                showHelp = true;
                // console.log({ b: argv._.length, numRequired, kill_argv });
            }
        } else if (argv._.length === numRequired) {
            if (!showHelp) {
                printError(`command "${kill_argv}" not found!\n`);
                yargs.showHelp();
                showHelp = true;
                // console.log({ c: argv._.length, numRequired, kill_argv });
            }
        }
    }
    // console.log({ global: argv._.length, numRequired });
}

// eslint-disable-next-line require-jsdoc
function exit() {
    process.exit(1);
}

// =============================================================================== //

// ============ banner ============ //
// let data = fs.readFileSync(path.join(__dirname, 'myfont.flf'), 'utf8');
// figlet.parseFont('myfont', data);
console.log(
    chalk.bold.green(
        figlet.textSync('JUMP-BOOT', {
            whitespaceBreak: true,
            font: 'ANSI Shadow',
            horizontalLayout: 'default',
            verticalLayout: 'default',
        })
    )
);

const daftar = {
    // command -> item
    create: ['middleware', 'controller', 'service', 'repo', 'entity', 'pack'],
    git: ['init', 'commit', 'push'],
};

let yargs = require('yargs');
// eslint-disable-next-line no-var
var argv = yargs
    .usage('usage: $0 <command>')
    // eslint-disable-next-line no-shadow
    .command('create', 'create a new [files|module]', (yargs) => {
        // create ...
        let name = yargs?.argv?.name;
        // eslint-disable-next-line require-jsdoc
        function sendFile(to) {
            if (name) {
                copyFile(
                    source_path[to],
                    target_path[to](
                        String(name)
                            .split(' ')
                            // eslint-disable-next-line id-length
                            .map((v) => {
                                return capitalizeFirstLetter(v);
                            })
                            .join('')
                    ),
                    to
                );
            } else {
                copyFile(
                    source_path[to],
                    target_path[to]('Example'),
                    to,
                );
            }
        }
        const list = daftar.create;
        argv = yargs
            .usage('usage: $0 create <item> [options]')
            .command('middleware', 'create a new middleware', () => {
                try {
                    sendFile('middleware');
                    console.log('creating middleware :)');
                } catch (error) {
                    console.log(error.message);
                } finally {
                    exit();
                }
            })
            .command('controller', 'create a new controller', () => {
                try {
                    sendFile('controller');
                    console.log('creating controller :)');
                } catch (error) {
                    console.log(error.message);
                } finally {
                    exit();
                }
            })
            .command('service', 'create a new service', () => {
                try {
                    sendFile('service');
                    console.log('creating service :)');
                } catch (error) {
                    console.log(error.message);
                } finally {
                    exit();
                }
            })
            .command('repo', 'create a new repository', () => {
                try {
                    sendFile('repository');
                    console.log('creating repository :)');
                } catch (error) {
                    console.log(error.message);
                } finally {
                    exit();
                }
            })
            .command('entity', 'create a new entities', () => {
                try {
                    sendFile('entities');
                    console.log('creating entities :)');
                } catch (error) {
                    console.log(error.message);
                } finally {
                    exit();
                }
            })
            .command('pack', 'create a all new file integrated', () => {
                try {
                    showHelp = true // skip help
                    Promise.resolve()
                        .then(() => {
                            sendFile('middleware');
                            console.log('creating middleware :)');
                        })
                        .then(() => {
                            sendFile('controller');
                            console.log('creating controller :)');
                        })
                        .then(() => {
                            sendFile('service');
                            console.log('creating service :)');
                        })
                        .then(() => {
                            sendFile('repository');
                            console.log('creating repository :)');
                        })
                        .then(() => {
                            sendFile('entities');
                            console.log('creating entities :)');
                        })
                        .then(() => {
                            exit();
                        })
                } catch (error) {
                    console.log(error.message);
                }
            })
            .option('n', {
                alias: 'name',
                description: 'give a name to the new file to be created',
                type: 'string',
            })
            .help('help')
            .updateStrings({
                'Commands:': 'item:',
            })
            .wrap(null).argv;
        const kill_argv = lastArgument(argv, 2);
        if (!showHelp && !list.includes(kill_argv)) {
            checkCommands(yargs, argv, 2);
        }
    })
    // eslint-disable-next-line no-shadow
    .command('git', 'version control source code', (yargs) => {
        // git...
        // eslint-disable-next-line no-unused-vars
        let message = yargs?.argv?.message;
        const list = daftar.git;
        argv = yargs
            .usage('usage: $0 git <item> [options]')
            .command('init', 'first initial project', () => {
                try {
                    console.log('creating init :)');
                } catch (error) {
                    console.log(error.message);
                } finally {
                    exit();
                }
            })
            .command('commit', 'create a commit message', () => {
                try {
                    console.log('creating commit :)');
                } catch (error) {
                    console.log(error.message);
                } finally {
                    exit();
                }
            })
            .command('push', 'get publish now...', () => {
                try {
                    console.log('creating push :)');
                } catch (error) {
                    console.log(error.message);
                } finally {
                    exit();
                }
            })
            .option('m', {
                alias: 'message',
                description: 'give a name to the new file to be created',
                type: 'string',
            })
            .help('help')
            .updateStrings({
                'Commands:': 'item:',
            })
            .wrap(null).argv;
        const kill_argv = lastArgument(argv, 2);
        if (!showHelp && !list.includes(kill_argv)) {
            checkCommands(yargs, argv, 2);
        }
    })
    .help('help')
    .wrap(null).argv;
if (!showHelp) {
    checkCommands(yargs, argv, 1);
}
