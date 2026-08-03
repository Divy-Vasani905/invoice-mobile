const { createRunOncePlugin, withAppBuildGradle } = require('@expo/config-plugins');

const PLUGIN_NAME = 'with-android-cmake-version';
const DEFAULT_CMAKE_VERSION = '3.31.6';
const MARKER = 'android-cmake-version plugin';

/**
 * Pins the CMake version used to build the app module's native code.
 *
 * The Android SDK's default CMake (3.22.1) bundles ninja 1.10.2, whose 260-character
 * path check is unconditional — it fails even when Windows long path support is
 * enabled. Long path awareness landed in ninja 1.11, shipped from CMake 3.31.x.
 * Codegen paths under node_modules/@react-native-firebase exceed 260 characters,
 * so Windows builds cannot complete without a newer CMake.
 *
 * Requires the pinned version to be installed: sdkmanager "cmake;3.31.6"
 *
 * Only applied on Windows. macOS, Linux, and EAS Build have no path limit, and
 * pinning there would fail on images that ship a different CMake.
 *
 * @type {import('@expo/config-plugins').ConfigPlugin<{ cmakeVersion?: string } | void>}
 */
const withAndroidCmakeVersion = (config, options) => {
  if (process.platform !== 'win32') {
    return config;
  }

  const cmakeVersion = options?.cmakeVersion ?? DEFAULT_CMAKE_VERSION;

  return withAppBuildGradle(config, (gradleConfig) => {
    const { contents, language } = gradleConfig.modResults;

    if (language !== 'groovy') {
      throw new Error(`${PLUGIN_NAME}: expected a Groovy build.gradle, received "${language}".`);
    }

    if (contents.includes(MARKER)) {
      return gradleConfig;
    }

    const androidBlock = /^android\s*\{[^\S\n]*$/m;

    if (!androidBlock.test(contents)) {
      throw new Error(`${PLUGIN_NAME}: could not locate the "android {" block in app/build.gradle.`);
    }

    const injected = [
      `    // ${MARKER}: ninja <1.11 rejects paths over 260 characters on Windows.`,
      '    externalNativeBuild {',
      '        cmake {',
      `            version = "${cmakeVersion}"`,
      '        }',
      '    }',
      '',
    ].join('\n');

    gradleConfig.modResults.contents = contents.replace(
      androidBlock,
      (match) => `${match}\n${injected}`
    );

    return gradleConfig;
  });
};

module.exports = createRunOncePlugin(withAndroidCmakeVersion, PLUGIN_NAME, '1.0.0');
