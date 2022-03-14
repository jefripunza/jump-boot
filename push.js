const child_process = require('child_process');

// eslint-disable-next-line require-jsdoc
function execute(cmd, dirname = __dirname) {
    return new Promise(async (resolve, reject) => {
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

// eslint-disable-next-line require-jsdoc
async function run() {
    const commit = process.argv
        .filter((v, i) => {
            return i > 1;
        })
        .join(' ');
    const cmd = [
        'git add .',
        `git commit -am "${commit}"`,
        'git push -f -u origin HEAD:main',
    ].join(' && ');
    try {
        await execute(cmd);
    } catch (error) {
        console.error(error);
    }
}
run();
