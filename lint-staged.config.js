module.exports = {
    'frontend/**/*.{js,jsx,ts,tsx}': [
        'prettier --write',
        'frontend/node_modules/.bin/eslint --fix',
    ],
    'frontend/**/*.{json,css,md}': ['prettier --write'],
};