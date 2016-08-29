var through2 = require('through2'),
    gutil = require('gulp-util'),
    template = [
      '@font-face {\n',
      '  font-family: "{{fontName}}";\n',
      '  font-style: {{fontStyle}};\n',
      '  font-weight: {{fontWeight}};\n',
      '  src: local("{{fontName}}"),\n',
      '       url("data:application/x-font-{{fontType}};base64,{{base64}}") format("{{fontType}}");\n',
      '}'
    ].join('');

module.exports = function (list) {
  'use strict';

  var files = [],
  transform = function (file, encoding, callback) {
    if (file.isNull()) {
      this.push(file);
      return callback();
    }
    files.push(file);

    callback();
  },
  flush = function (callback) {
    files.forEach(function (file, idx) {
      var regexResult = file.path.match(/^.*\/(.+)\.(woff|woff2)$/),
      fileName = regexResult[1],
      fontType = regexResult[2],
      fontName = fileName.split('_')[0].replace(/_/g, ' ').replace('-', ' '),
      base64 = file.contents.toString('base64'),
      fontWeight = fileName.split('_')[1],
      fontStyle = fileName.split('_')[2],
      tmpl = template
             .replace(/{{fontName}}/g, fontName)
             .replace(/{{fontType}}/g, fontType)
             .replace(/{{fontStyle}}/g, fontStyle)
             .replace(/{{fontWeight}}/g, fontWeight)
             .replace('{{base64}}', base64),
      output = new gutil.File({
        cwd: file.cwd,
        base: file.base,
        path: file.base + fontType + '/' + fileName + '.css'
      });

      output.contents = new Buffer(tmpl);
      this.push(output);
    }.bind(this));

    callback();
  };

  return through2.obj(transform, flush);

};
