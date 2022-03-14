const pathResolver = require('path');
const fs = require('fs');

class ReadDirectory {
    // eslint-disable-next-line require-jsdoc
    constructor(pathDirectory, fromRd) {
        this.pathDirectory = pathDirectory;
        this.isDirectory = true;
        this.isFile = false;
        this.items = fs.readdirSync(this.pathDirectory);
        this.ClassAnnotations = require('..')(pathDirectory);
        this.items.forEach((itemName) => {
            if (pathResolver.basename(itemName).split('.').pop() === 'js') {
                this[itemName] = new this.ClassAnnotations(itemName);
                // cancel recursive append data
                if (this[itemName][itemName]) {
                    this[itemName] = this[itemName][itemName];
                }
            } else if (
                fs
                    .lstatSync(pathResolver.join(this.pathDirectory, itemName))
                    .isDirectory()
            ) {
                // read depths directory
                this[itemName] = new ReadDirectory(
                    `${pathResolver.join(this.pathDirectory, itemName)}/`,
                    this.pathDirectory
                );
                // cancel recursive append data
                if (this[itemName][itemName]) {
                    this[itemName] = this[itemName][itemName];
                }
            }
        });
        if (fromRd) {
            // eslint-disable-next-line no-underscore-dangle
            this.ClassAnnotations.__DIR__ = fromRd;
        }
        this.clearOutput();
    }

    // eslint-disable-next-line require-jsdoc
    clearOutput() {
    // eslint-disable-next-line no-unused-expressions
        this.items;
        delete this.ClassAnnotations;
        delete this.pathDirectory;
    }
}

module.exports = ReadDirectory;
