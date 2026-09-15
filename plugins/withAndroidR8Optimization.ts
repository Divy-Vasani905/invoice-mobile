import { ConfigPlugin, withAppBuildGradle } from 'expo/config-plugins';

const withAndroidR8Optimization: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = config.modResults.contents.replace(
        'proguard-android.txt',
        'proguard-android-optimize.txt',
      );
    }

    return config;
  });
};

export default withAndroidR8Optimization;
