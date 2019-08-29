module.exports = {
  genCode: function (css) {
    let text = JSON.stringify(css)
    const runTimeCode = `
      (function (css) {
        var style = document.getElementById('css-loader');
        if (!style) {
          style = document.createElement('style');
          style.setAttribute('id', 'css-loader');
          style.textContent = css;
          document.head.appendChild(style);
        } else {
          style.textContent = style.textContent + '\\n'+ css;
        }
      })(${text});
    `
    return runTimeCode
  }
}