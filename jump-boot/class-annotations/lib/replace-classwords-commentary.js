const markerHit = 'MARKER_REMOVE_BEFORE_COMPILING';

const replaceInner = (subcontent) => {
    while (subcontent.indexOf('class ') !== -1) {
    // eslint-disable-next-line no-param-reassign
        subcontent = subcontent.replace('class', markerHit);
    }
    return subcontent;
};

// eslint-disable-next-line func-names
module.exports = function (classcontent) {
    if (typeof classcontent !== 'string') {
        throw new RangeError('arg1: contentclass should be a `string` value');
    }
    if (!classcontent.length || classcontent.indexOf('class') === -1) {
        return classcontent;
    }
    // eslint-disable-next-line no-param-reassign
    classcontent = classcontent.split('\n');
    let isInsideCommentary = false;
    // eslint-disable-next-line no-param-reassign
    classcontent = classcontent.map((line) => {
        if (isInsideCommentary) {
            // search close commentary
            // eslint-disable-next-line no-param-reassign
            line = replaceInner(line);
            if (line.indexOf('*/') !== -1) {
                isInsideCommentary = false;
            }
        } else {
            if (line.indexOf('/*') !== -1 && line.indexOf('*/') !== -1) {
                // have open and close on line: line
                const beforeIndex = line.indexOf('/*');
                const afterIndex = line.indexOf('*/');
                const contentCommentaryLine = line.slice(beforeIndex, afterIndex + 2);
                const contentReplaceCommentaryLine = replaceInner(
                    contentCommentaryLine
                );
                // eslint-disable-next-line no-param-reassign
                line = line.replace(
                    contentCommentaryLine,
                    contentReplaceCommentaryLine
                );
                return line;
            } else if (line.indexOf('*/') !== -1) {
                // check error close commentary
                // have found close comment
                // but not inside commentary
                // eslint-disable-next-line no-throw-literal
                throw 'have found close comment but not inside commentary, resolve annotation have fail';
            }
            // can be inside string value:
            // `const foo = "/*" ; not a commentary :'(`
            if (line.indexOf('/*') !== -1) {
                // eslint-disable-next-line no-param-reassign
                line = replaceInner(line);
                if (
                // eslint-disable-next-line no-useless-escape
                    (/^\/\*(\*|\!)?$/).test(line.trim()) ||
          line.trim().slice(-2) === '/*'
                ) {
                    isInsideCommentary = true;
                }
            }
            if (line.indexOf('//') !== -1) {
                // eslint-disable-next-line no-param-reassign
                line = replaceInner(line);
                return line;
            }
        }
        return line;
    });
    return classcontent.join('\n');
};
