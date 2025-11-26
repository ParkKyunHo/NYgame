module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // import.meta.env를 process.env로 변환
            ['transform-import-meta', {
                replaceWith: '({ env: { MODE: "production", NODE_ENV: "production" } })'
            }],
            'react-native-reanimated/plugin',
        ],
    };
};
