const { withPodfile } = require('@expo/config-plugins');

function withFirebaseDisableSPM(config) {
  return withPodfile(config, (config) => {
    const podfile = config.modResults.contents;

    if (!podfile.includes('$RNFirebaseDisableSPM')) {
      config.modResults.contents = '$RNFirebaseDisableSPM = true\n\n' + podfile;
    }

    return config;
  });
}

module.exports = withFirebaseDisableSPM;
