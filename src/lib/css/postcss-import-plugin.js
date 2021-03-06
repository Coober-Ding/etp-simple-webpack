const postcss = require('postcss');
const valueParser = require('postcss-value-parser');
const pluginName = 'postcss-import-plugin';

function getArg(nodes) {
  return nodes.length !== 0 && nodes[0].type === 'string'
    ? nodes[0].value
    : valueParser.stringify(nodes);
}

function getUrl(node) {
  if (node.type === 'function' && node.value.toLowerCase() === 'url') {
    return getArg(node.nodes);
  }

  if (node.type === 'string') {
    return node.value;
  }

  return null;
}

function parseImport(params) {
  const { nodes } = valueParser(params);

  if (nodes.length === 0) {
    return null;
  }

  const url = getUrl(nodes[0]);

  if (!url || url.trim().length === 0) {
    return null;
  }

  return {
    url,
    media: valueParser
      .stringify(nodes.slice(1))
      .trim()
      .toLowerCase(),
  };
}

function walkAtRules(css, result) {
  const items = [];

  css.walkAtRules(/^import$/i, (atRule) => {
    // Convert only top-level @import
    if (atRule.parent.type !== 'root') {
      return;
    }

    if (atRule.nodes) {
      result.warn(
        "It looks like you didn't end your @import statement correctly. " +
          'Child nodes are attached to it.',
        { node: atRule }
      );
      return;
    }

    const parsed = parseImport(atRule.params);

    if (!parsed) {
      // eslint-disable-next-line consistent-return
      return result.warn(`Unable to find uri in '${atRule.toString()}'`, {
        node: atRule,
      });
    }

    atRule.remove();

    const { url, media } = parsed;

    items.push({ url, media });
  });

  return items;
}

module.exports = postcss.plugin(
  pluginName,
  (options = {}) =>
    function process(css, result) {
      let pathResolver = options.pathResolver
      const paths = walkAtRules(css, result);
      paths.forEach((item) => {
        // 处理相对路径的url
        item.url = pathResolver.resolveImport(item.url)
        result.messages.push({
          pluginName,
          type: 'import',
          import: item
        });
      });
    }
);
