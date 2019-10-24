"use strict";
// vue compiler module for transforming `<tag>:<attribute>` to `require`
Object.defineProperty(exports, "__esModule", { value: true });

const defaultOptions = {
  tags: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: ['xlink:href', 'href'],
    use: ['xlink:href', 'href']
  }
};
exports.create = (userOptions) => {
  const options = userOptions ? Object.assign({}, defaultOptions, userOptions) : defaultOptions;
  return {
    postTransformNode: (node) => {
      transform(node, options);
    }
  };
};
function isAimedTag (node, options) {
  return Object.keys(options.tags).indexOf(node.tag) >= 0
}
function transform(node, options) {
  if (!isAimedTag(node, options))
    return
  let tag = node.tag
  let aimedAttrs = !Array.isArray(options.tags[tag]) ? [options.tags[tag]] : options.tags[tag];

  aimedAttrs.forEach(aimedAttr => {
    // 找到aimed attr
    let attr = node.attrs.find(({name}) => name == aimedAttr)
    // 重写
    rewrite(attr, options.pathResolver)
  });
}
function rewrite(attr, pathResolver) {
  const value = attr.value;
  // only transform static URLs
  if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
    attr.value = `"${pathResolver.resolve(value.slice(1, -1))}"`
  }
}
