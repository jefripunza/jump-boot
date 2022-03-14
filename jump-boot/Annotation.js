/**
 * Author      : Jefri Herdi Triyanto
 * Description : semua anotasi dari .properties akan dibaca oleh module ini
 */

const fs = require('fs');
const path = require('path');

const { MethodAvailable } = require('./Enum');

// eslint-disable-next-line require-jsdoc
function filterClass(class_init) {
    const name = class_init.items[0];
    return {
    // eslint-disable-next-line no-underscore-dangle
        _pathFile: class_init._pathFile,
        name,
        globalAnnotations: Object.keys(class_init[name].annotations.data).reduce(
            (simpan, key) => {
                return {
                    ...simpan,
                    [key]: class_init[name].annotations.data[key].value,
                };
            },
            {}
        ),
        methods:
      class_init.methods === undefined ?
          [] :
          class_init?.methods[name]
              .reduce((simpan_methods, item) => {
                  return [
                      ...simpan_methods,
                      {
                          function_name: item.method,
                          annotations: Object.keys(item.data).reduce(
                              (simpan_data, key_data) => {
                                  return {
                                      ...simpan_data,
                                      [key_data]: item.data[key_data].value,
                                  };
                              },
                              {}
                          ),
                      },
                  ];
              }, [])
              .filter((method) => {
                  const annotation = Object.keys(method.annotations);
                  let ok = false;
                  annotation.forEach((anno) => {
                      if (MethodAvailable.includes(anno)) {
                          ok = true;
                      }
                  });
                  return ok;
              }),
    };
}

module.exports = (important_directories) => {
    const path_controllers = path.join(
        __dirname,
        '..',
        important_directories.controllers
    );
    const ClassAnnotations = require('./class-annotations')(path_controllers);
    const controllers = [];
    fs.readdirSync(path_controllers).forEach((controller) => {
        controllers.push(filterClass(new ClassAnnotations(controller)));
    });
    return controllers;
};
