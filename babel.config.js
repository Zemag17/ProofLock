module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@services": "./src/services",
            "@store": "./src/store",
            "@navigation": "./src/navigation",
            "@app": "./src/app",
            "@theme": "./src/theme",
            "@types": "./src/types"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};