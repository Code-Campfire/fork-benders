module.exports = {
    'frontend/**/*.{js,jsx,ts,tsx}': [
        'prettier --write',
        './lint-frontend.sh',
    ],
    'frontend/**/*.{json,css,md}': ['prettier --write'],
};