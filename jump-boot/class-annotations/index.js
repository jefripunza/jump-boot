/**
 *
 * @TODO: resolve keywords @class inner commentary
 *
 * ./lib/replace-classwords-commentary.js <- string|content -> string|normalizeContent
 *
 * and call before ciclelyfe complier for each content file
 */

const pathResolver = require('path');
const fs = require('fs');

const ReaderAnnotations = require('./lib/reader-annotations');
const clientDir = require('./lib/client-dir')();
const ReadDirectory = require('./lib/read-directory');

const replaceClassInsideCommentary = require('./lib/replace-classwords-commentary');

class ClassAnnotation {
    // marker of class keywords
    static detectorClass =
        '<0x01023658956587452455269552224021255888520__CLASS__DETECTOR__01023658956587452455269552224021255888520>';
    static __DIR__ = null;

    // eslint-disable-next-line require-jsdoc
    constructor(pathFile) {
        this.pathFile = pathFile;
        this.items = [];
        if (fs.existsSync(this.pathFile)) {
            // eslint-disable-next-line no-underscore-dangle
            this.contentFile = fs.readFileSync(this._pathFile, 'utf-8');
            this.isFile = true;
            this.isDirectory = false;
            this.contentFile = replaceClassInsideCommentary(this.contentFile);
            this.runHeaderClass();
            this.runBodyClass();
        } else {
            // here file not exists
            this.pathDirectory = pathFile;
            if (fs.existsSync(this.pathDirectory)) {
                // this path is an directory
                const directoryName = pathResolver.basename(this.pathDirectory);
                this[directoryName] = new ReadDirectory(this.pathDirectory);
            } else {
                this.success = false;
                this.details = `ClassAnnotations Error: file not found from: ${this.pathFile}`;
            }
        }
        this.cleanOutput();
    }

    // eslint-disable-next-line require-jsdoc
    runHeaderClass() {
        if (this.contentFile.indexOf('/**') !== -1) {
            // eslint-disable-next-line no-unused-expressions
            this.countClassDefine; // getter build: "this.countClass" and "this.classIndex" attributes
            // eslint-disable-next-line no-unused-expressions
            this.isolatePartial; // getter build: "this.partials" attribute
            this.filterPartial().instancesReaders();
        }
        this.success = true;
    }

    // eslint-disable-next-line require-jsdoc
    runBodyClass() {
        this.bodyAnnotations = [];
        if (!this.classIndex) {
            // job reject this file not contains class define
            this.success = false;
            this.cleanOutput();
        } else {
            this.classIndex.forEach((classIndex) => {
                const outsideClass = this.contentFile
                    .slice(classIndex.index + ClassAnnotation.detectorClass.length)
                    .trim();
                const markerOpen = outsideClass.indexOf('{');
                const innerClass = outsideClass.slice(markerOpen + 1).trim();
                if (innerClass.indexOf('/**') !== -1) {
                    this.extractBodyClassAnnotations(innerClass, classIndex.classname);
                }
            });
        }
    }

    // eslint-disable-next-line require-jsdoc
    extractBodyClassAnnotations(contentClass, classname) {
    // eslint-disable-next-line no-useless-escape
        const PATTERN_METHOD_OPEN = /^[a-z]{1}[a-z\d\_]{0,254}.*\(.*/;
        // eslint-disable-next-line no-param-reassign
        contentClass = contentClass
            .split('\n')
            .filter((line) => {
                return Boolean(line.length);
            })
            .map((line) => {
                return line.trim();
            });
        let isOpened = false;
        let openToLine = null;
        let closeToLine = null;
        contentClass.forEach((line, key) => {
            if (closeToLine) {
                // check if this line is an define method
                if (PATTERN_METHOD_OPEN.test(line.trim())) {
                    if (closeToLine + 1 !== key) {
                        isOpened = false;
                        openToLine = null;
                        closeToLine = null;
                        return;
                    }
                    let out = false;
                    const method = line
                        .split('(')[0]
                        .replace('(', '')
                        .replace(')', '')
                        .replace('{', '')
                        .trim()
                        .split('')
                        .filter((char) => {
                            if (out) {
                                return false;
                            }
                            // eslint-disable-next-line no-useless-escape
                            if (!(/^[a-z\d\_]$/i).test(char)) {
                                out = true;
                                return false;
                            }
                            return true;
                        })
                        .join('');
                    this.bodyAnnotations.push({
                        classname,
                        method,
                        lines: contentClass.slice(openToLine, closeToLine + 1),
                    });
                    isOpened = false;
                    closeToLine = null;
                    openToLine = null;
                }
            }
            if (isOpened) {
                if (line.indexOf('/**') !== -1) {
                    openToLine = key;
                    closeToLine = null;
                }
                if (line.indexOf('*/') !== -1) {
                    closeToLine = key;
                }
            } else if (line.indexOf('/**') !== -1) {
                isOpened = true;
                openToLine = key;
            }
        });
        this.methods = {};
        this.bodyAnnotations.forEach((body) => {
            const pusher = {
                classname: body.classname,
                method: body.method,
                annotations: new ReaderAnnotations(body.lines, body.classname),
                get data() {
                    return this.annotations.data;
                },
            };
            if (this.methods[body.classname] instanceof Array) {
                this.methods[body.classname].push(pusher);
            } else {
                const arrMethods = this.extendsMethodArray();
                arrMethods.push(pusher);
                this.methods[body.classname] = arrMethods;
            }
        });
    }

    // eslint-disable-next-line require-jsdoc
    extendsMethodArray() {
        const arrMethods = [];
        // arr.getWidth( "Route" )
        // arr.getWidth( /^Route$/ )
        // eslint-disable-next-line func-names
        arrMethods.getWidth = function (matcher) {
            // eslint-disable-next-line no-param-reassign
            matcher =
        typeof matcher === 'string' ?
            new RegExp(`^${matcher}$`) :
            matcher instanceof RegExp ?
                matcher :
                null;
            if (!matcher) {
                // eslint-disable-next-line new-cap
                throw RangeError(
                    'arg1: matcher should be a string value or a instanceof RegExp'
                );
            }
            const annotationsMethod = [];
            this.forEach((method) => {
                const data = method.data;
                Object.keys(data).forEach((attr) => {
                    if (matcher.test(attr)) {
                        annotationsMethod.push({
                            ...data[attr],
                            as: attr,
                            classname: method.classname,
                            method: method.method,
                        });
                    }
                });
            });
            return annotationsMethod;
        };
        return arrMethods;
    }

    // eslint-disable-next-line require-jsdoc
    instancesReaders() {
        this.partials.forEach((partial) => {
            this.worker = partial;
            if (partial.isLastLine && partial.isOpened) {
                this[partial.classname] = this.buildReaderData();
            }
        });
        return this;
    }

    // eslint-disable-next-line require-jsdoc
    buildReaderData() {
        const partial = this.worker;
        this.items.push(partial.classname);
        return {
            classname: partial.classname,
            annotations: new ReaderAnnotations(partial.lines, partial.classname),
            get data() {
                return this.annotations.data;
            },
        };
    }

    // eslint-disable-next-line require-jsdoc
    filterPartial() {
        this.partials.forEach((partial) => {
            if (partial.isLastLine) {
                // eslint-disable-next-line no-param-reassign
                partial = this.checkOpenedAnnotation(partial);
            }
        });
        return this;
    }

    // eslint-disable-next-line require-jsdoc
    get pathDirectory() {
    // eslint-disable-next-line no-underscore-dangle
        return this._pathDirectory;
    }
    // eslint-disable-next-line require-jsdoc
    set pathDirectory(pathDirectory) {
        if (pathResolver.isAbsolute(pathDirectory)) {
            // eslint-disable-next-line no-underscore-dangle
            this._pathDirectory = pathDirectory;
        } else {
            // eslint-disable-next-line no-underscore-dangle
            this._pathDirectory = pathResolver.join(
                // eslint-disable-next-line no-underscore-dangle
                ClassAnnotation.__DIR__,
                pathDirectory
            );
        }
    }

    // eslint-disable-next-line require-jsdoc
    get pathFile() {
    // eslint-disable-next-line no-underscore-dangle
        return this._pathFile;
    }
    // eslint-disable-next-line require-jsdoc
    set pathFile(pathFile) {
        if (pathResolver.isAbsolute(pathFile)) {
            // eslint-disable-next-line no-underscore-dangle
            this._pathFile = pathFile;
        } else {
            // eslint-disable-next-line no-underscore-dangle
            this._pathFile = pathResolver.join(ClassAnnotation.__DIR__, pathFile);
        }
        // resolve ext file
        if (pathResolver.basename(pathFile).split('.').pop() !== 'js') {
            // eslint-disable-next-line no-underscore-dangle
            this._pathFile = `${this._pathFile}.js`;
        }
    }

    // eslint-disable-next-line require-jsdoc
    cleanOutput() {
    // persist only final data
        delete this.partials;
        delete this.isAlreadyCount;
        delete this.classIndex;
        delete this.contentFile;
        delete this.worker;
        delete this.bodyAnnotations;
        return this;
    }

    // eslint-disable-next-line require-jsdoc
    checkOpenedAnnotation(partial) {
        const lines = partial.lines;
        // eslint-disable-next-line id-length
        let i = lines.length - 1;
        let isFoundOpened = false;
        while (!isFoundOpened && i >= 0) {
            const currentLine = lines[i];
            if (currentLine.indexOf('/**') !== -1) {
                isFoundOpened = true;
                partial.isOpened = true;
                partial.lines = partial.lines.slice(i);
            }
            i--;
        }

        if (!isFoundOpened) {
            partial.isOpened = false;
        }
        return partial;
    }

    /**
   * @init `partials` attribute
   */
    get isolatePartial() {
        if (!this.partials) {
            this.partials = [];
        } else {
            return this.partials;
        }
        this.classIndex.forEach((item, key) => {
            const index = item.index;
            let startSlice = this.classIndex[key - 1];
            if (!key) {
                startSlice = 0;
            } else {
                startSlice = startSlice + (ClassAnnotation.detectorClass.length + 1);
            }
            const partial = this.contentFile
                .slice(startSlice, index)
                .split('\n')
                .filter((line) => {
                    return Boolean(line.length);
                });
            if (partial.length === 0) {
                return;
            }
            this.partials.push({
                lines: partial,
                isLastLine: partial[partial.length - 1].indexOf('*/') !== -1,
                classname: item.classname,
            });
        });
        return this.partials;
    }

    // eslint-disable-next-line require-jsdoc
    normalizeClassname(lineClassname) {
    // eslint-disable-next-line no-param-reassign
        lineClassname = lineClassname
            .split('\n')[0]
            .replace('class ', '')
            .replace('{', '')
            .trim();
        let backClassname = '';
        // eslint-disable-next-line id-length
        let i = 0;
        let isValidChar = 'azertyuiopqsdfghjklmwxcvbn_0123456789';
        while (
            isValidChar.includes(lineClassname.charAt(i).toLocaleLowerCase()) &&
      i < lineClassname.length
        ) {
            backClassname = backClassname + lineClassname.charAt(i++);
        }
        return backClassname.trim();
    }

    /**
   * @init `countClass` attribute
   * @init `classIndex` attribute
   * @returns {Number} `countClass`
   */
    get countClassDefine() {
        if (this.isAlreadyCount) {
            return this.countClass;
        }
        this.isAlreadyCount = true;
        this.countClass = 0;
        this.classIndex = [];
        const searcher = 'class ';
        while (this.contentFile.indexOf(searcher) !== -1) {
            this.classIndex.push({
                index: this.contentFile.indexOf(searcher),
                classname: this.normalizeClassname(
                    this.contentFile.slice(this.contentFile.indexOf(searcher))
                ),
            });
            this.contentFile = this.contentFile.replace(
                searcher,
                ClassAnnotation.detectorClass
            );
            this.countClass++;
        }
        return this.countClass;
    }

    // eslint-disable-next-line require-jsdoc
    static create(__DIR__) {
    // eslint-disable-next-line no-underscore-dangle
        ClassAnnotation.__DIR__ = typeof __DIR__ === 'string' ? __DIR__ : clientDir;
        if (typeof __DIR__ !== 'string' || !pathResolver.isAbsolute(__DIR__)) {
            // eslint-disable-next-line new-cap
            throw RangeError('ClassAnnotation should be an absolute path');
        }
        return ClassAnnotation;
    }
}

module.exports = ClassAnnotation.create;
