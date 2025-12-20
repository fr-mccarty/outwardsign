/**
 * Local ESLint plugin for Outward Sign
 * 
 * Custom rules to enforce project conventions.
 */

const noDirectUiImports = require('./no-direct-ui-imports');

module.exports = {
  rules: {
    'no-direct-ui-imports': noDirectUiImports,
  },
};
