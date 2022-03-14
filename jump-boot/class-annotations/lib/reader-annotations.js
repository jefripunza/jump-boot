class ReaderAnnotations {
    static validSeparators = ['=', ':', '=>', '=:', '('];

    /**
   * @param {*} lines
   * @param {*} classname
   */
    constructor(lines, classname) {
        this.lines = lines.slice(1, -1);
        this.worker = null;
        this.classname = classname;
        this.init();
    }

    // eslint-disable-next-line require-jsdoc
    init() {
        this.currentMultiline = '';
        this.isMultiLine = false;
        this.currentMultilineKey = null;
        this.data = {
            excludes: [],
        };
        this.resolveLines();
        this.data.excludes = this.data.excludes.filter((exclude) => {
            return Boolean(exclude.length);
        });
        this.cleanOutput();
    }

    // eslint-disable-next-line require-jsdoc
    resolveLines() {
        this.lines.forEach((line, lineNumber) => {
            // eslint-disable-next-line no-param-reassign
            line = line.replace('*', '').trim();
            this.worker = line;
            if (this.isArobase || this.isMultiLine) {
                if (this.isMultiLine) {
                    this.execOneMultiline(lineNumber);
                }
                if (this.canMultiLine) {
                    this.prepareMultiline(lineNumber);
                } else if (
                    !this.isMultiLine &&
                    this.keyName.trim()
                        .length /* because can be an empty line closed from last multiline */
                ) {
                    // here: one shot one line
                    this.oneLine(lineNumber);
                }
            } else {
                // ecludes value
                // this line is an brut commentary
                this.data.excludes.push(this.worker);
            }
        });
    }

    // eslint-disable-next-line require-jsdoc
    get canMultiLine() {
        return this.worker.replace(`@${this.keyName}`, '').trim().charAt(0) === '(';
    }

    // eslint-disable-next-line require-jsdoc
    prepareMultiline(lineNumber) {
        const rv = this.rValueBrut.trim().slice(1);
        const isEndLine = rv[rv.length - 1] === ')';
        this.currentMultilineKey = this.keyName;
        if (!isEndLine) {
            this.isMultiLine = true;
            this.currentMultiline = rv;
        } else {
            this.oneLine(lineNumber);
        }
    }

    // eslint-disable-next-line require-jsdoc
    execOneMultiline(lineNumber) {
        // eslint-disable-next-line id-length
        let v = this.worker;
        const isEndLine = v[v.length - 1] === ')';
        if (isEndLine) {
            this.isMultiLine = false;
            v = v.slice(0, -1);
        }
        this.currentMultiline = this.currentMultiline + v;
        if (isEndLine) {
            this.data[this.currentMultilineKey] = {
                valueBrut: this.currentMultiline.trim(),
            };
            const data = this.persistDataType(
                this.data[this.currentMultilineKey].valueBrut,
                lineNumber
            );
            this.data[this.currentMultilineKey].value = data;
            this.currentMultiline = '';
            delete this.currentMultilineKey;
        }
    }

    // eslint-disable-next-line require-jsdoc
    oneLine(lineNumber) {
        if (this.keyName.trim().length) {
            let keyName = this.keyName;
            const value = this.rValue
            this.data[keyName] = {
                valueBrut: value === '' ? true : value, // auto true
            };
            const data = this.persistDataType(
                this.data[keyName].valueBrut,
                lineNumber
            );
            // eslint-disable-next-line max-len
            if (String(data).startsWith('Parse Error to line') && keyName !== 'TODO') { // pembacaan dan pengubahan nilai dari sebuah anotasi
                // eslint-disable-next-line operator-assignment
                delete this.data[keyName] // hapus sampah
                keyName = keyName + value
                this.data[keyName] = { value: true };
                // console.log({ keyName, value, data }); // debug
            } else {
                this.data[keyName].value = data;
            }
        }
    }

    // eslint-disable-next-line require-jsdoc
    persistDataType(brutData, lineNumber) {
        let back = undefined;
        try {
            // eslint-disable-next-line no-eval
            back = eval(`() => (${brutData})`)();
        } catch (Exception) {
            //
        }
        if (back === undefined && brutData !== 'undefined') {
            back =
                `Parse Error to line: ${lineNumber + 1}` +
                ` after opened annotations of class: ${this.classname} , error: ${brutData}...`;
        }
        return back;
    }

    // eslint-disable-next-line require-jsdoc
    cleanOutput() {
        // persist only final data
        if (!this.data.excludes.length) {
            delete this.data.excludes;
        }
        delete this.worker;
        delete this.lines;
        delete this.isMultiLine;
        delete this.currentMultiline;
        delete this.classname;
        return this;
    }

    // eslint-disable-next-line require-jsdoc
    removeSeparatorFromRvalue(rValueBrut) {
        let separator = null;
        ReaderAnnotations.validSeparators.forEach((sep) => {
            // eslint-disable-next-line no-return-assign
            return rValueBrut.indexOf(sep) !== -1 ? separator = sep : null;
        });
        if (!separator) {
            return rValueBrut;
        }
        if (separator !== '(') {
            return rValueBrut.replace(separator, '').trim();
        }
        return rValueBrut.trim().slice(1, -1).trim();
    }
    // eslint-disable-next-line require-jsdoc
    get rValue() {
        const keyName = this.keyName;
        let start = this.worker.slice(1);
        let rValueWithSeparator = start.replace(keyName, '').trim();
        return this.removeSeparatorFromRvalue(rValueWithSeparator);
    }
    // warn did code
    // eslint-disable-next-line require-jsdoc
    get remoteSeparator() {
        return this.rValueBrut.trim().charAt(0);
    }
    // eslint-disable-next-line require-jsdoc
    get rValueBrut() {
        // natural right value have not remove separator
        // for can remote separator value
        const keyName = this.keyName;
        let start = this.worker.slice(1);
        let rValueWithSeparator = start.replace(keyName, '').trim();
        return rValueWithSeparator;
    }
    // eslint-disable-next-line require-jsdoc
    get isArobase() {
        // is start line value
        return this.worker.charAt(0) === '@';
    }
    // eslint-disable-next-line require-jsdoc
    get keyName() {
        // remote keyname of start line value
        let start = this.worker.slice(1);
        // eslint-disable-next-line id-length
        let i = 0;
        let back = '';
        let isValidCharName = 'azertyuiopqsdfghjklmwxcvbn_0123456789';
        while (
            isValidCharName.includes(start.charAt(i).toLocaleLowerCase()) &&
            i < start.length - 1
        ) {
            back = back + start.charAt(i++);
        }
        return back;
    }
}

module.exports = ReaderAnnotations;
