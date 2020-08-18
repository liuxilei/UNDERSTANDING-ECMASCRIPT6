module.exports = {
    parser: 'babel-eslint',
    env: {
        browser: true,
        es6: true,
    },
    extends: 'eslint:recommended',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        'no-unused-vars': 1,
        'no-prototype-builtins': 1,
        'no-extra-semi': 1,
        'no-extra-boolean-cast': 1,
        'require-yield': 1,
        'no-compare-neg-zero': 1,
        'use-isnan': 1,
        'no-sparse-arrays': 1,
        'no-unreachable': 1,
        'no-undef': 1,
    },
};
