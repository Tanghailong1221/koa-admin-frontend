module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  rules: {
    'selector-class-pattern': null,
  },
  ignoreFiles: ['node_modules/**/*', 'dist/**/*'],
}

