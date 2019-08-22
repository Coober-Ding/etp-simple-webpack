module.exports = {
  genCode: function (css) {
    let text = JSON.stringify(css)
    const runTimeCode = `
      (function (css) {
        const style = document.createElement('style');
        style.textContent = css
        document.head.appendChild(style);
      })(${text});
    `
    return runTimeCode
  }
}