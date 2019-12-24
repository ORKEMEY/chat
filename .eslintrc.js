module.exports = {
  env: {
    browser: true,
    node: false,
  },
  extends: ['airbnb'],
  plugins: ['import', 'prettier'],
  parser: 'babel-eslint',
  rules: {
    'linebreak-style': 'off',
    'no-unused-vars': 'off',
    'prettier/prettier': 'off',
    'no-undef': 'off',
    'no-arrow-parens': 'off',
    'no-console': 'off',
    'consistent-return': 'off',
    'no-shadow': 'off',
    'no-alert': 'off',
    'func-names': 'off',
    'arrow-parens' : 'off',
    'space-before-function-paren' : 'off',
    'operator-linebreak' : 'off'
  },
};
