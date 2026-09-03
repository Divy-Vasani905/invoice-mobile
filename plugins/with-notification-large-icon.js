const { existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const {
  AndroidConfig,
  withAndroidManifest,
  withAndroidColors,
  withDangerousMod,
} = require('@expo/config-plugins');
const { generateImageAsync } = require('@expo/image-utils');
const { PNG } = require('pngjs');

const LARGE_ICON_SRC = './assets/images/notification-icon.jpg';
/** Alpha-only silhouette. Full-color logos become a solid square on Android. */
const SMALL_ICON_SRC = './assets/images/notification-icon-small.png';
const LARGE_RESOURCE_NAME = 'notification_large_icon';
const SMALL_RESOURCE_NAME = 'notification_icon';
const ICON_COLOR_NAME = 'notification_icon_color';
const ICON_COLOR_VALUE = '#FFFFFF';
const META_DATA_LARGE_ICON = 'expo.modules.notifications.large_notification_icon';
const META_DATA_SMALL_ICON = 'expo.modules.notifications.default_notification_icon';
const META_DATA_ICON_COLOR = 'expo.modules.notifications.default_notification_color';

const LARGE_ICON_SIZES = {
  'drawable-mdpi': 64,
  'drawable-hdpi': 96,
  'drawable-xhdpi': 128,
  'drawable-xxhdpi': 192,
  'drawable-xxxhdpi': 256,
};

const SMALL_ICON_SIZES = {
  'drawable-mdpi': 24,
  'drawable-hdpi': 36,
  'drawable-xhdpi': 48,
  'drawable-xxhdpi': 72,
  'drawable-xxxhdpi': 96,
};

function keepGlyphAlpha(pngBuffer) {
  const image = PNG.sync.read(pngBuffer);
  for (let i = 0; i < image.data.length; i += 4) {
    const alpha = image.data[i + 3];
    image.data[i] = 255;
    image.data[i + 1] = 255;
    image.data[i + 2] = 255;
    image.data[i + 3] = alpha < 16 ? 0 : 255;
  }
  return PNG.sync.write(image);
}

async function writeSmallNotificationIcons(projectRoot, resRoot) {
  for (const [folderName, size] of Object.entries(SMALL_ICON_SIZES)) {
    const folderPath = resolve(resRoot, folderName);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    const { source } = await generateImageAsync(
      { projectRoot, cacheType: 'android-notification-small-silhouette' },
      {
        src: SMALL_ICON_SRC,
        width: size,
        height: size,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
      },
    );

    writeFileSync(resolve(folderPath, `${SMALL_RESOURCE_NAME}.png`), keepGlyphAlpha(source));
  }
}

async function writeLargeNotificationIcons(projectRoot, resRoot) {
  for (const [folderName, size] of Object.entries(LARGE_ICON_SIZES)) {
    const folderPath = resolve(resRoot, folderName);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    const { source } = await generateImageAsync(
      { projectRoot, cacheType: 'android-notification-large-v2' },
      {
        src: LARGE_ICON_SRC,
        width: size,
        height: size,
        resizeMode: 'cover',
        backgroundColor: '#FFFFFF',
      },
    );
    writeFileSync(resolve(folderPath, `${LARGE_RESOURCE_NAME}.png`), source);
  }
}

async function generateAndroidNotificationIcons(projectRoot) {
  const resRoot = resolve(projectRoot, 'android/app/src/main/res');
  await writeLargeNotificationIcons(projectRoot, resRoot);
  await writeSmallNotificationIcons(projectRoot, resRoot);
}

/**
 * Configures Android notification icons:
 * - large icon: full-color app logo
 * - small icon: white-on-transparent silhouette (Android uses alpha only)
 *
 * @type {import('@expo/config-plugins').ConfigPlugin}
 */
const withNotificationLargeIcon = (config) => {
  config = withAndroidColors(config, (modConfig) => {
    modConfig.modResults = AndroidConfig.Colors.assignColorValue(modConfig.modResults, {
      name: ICON_COLOR_NAME,
      value: ICON_COLOR_VALUE,
    });
    return modConfig;
  });

  config = withAndroidManifest(config, (modConfig) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(modConfig.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      META_DATA_LARGE_ICON,
      `@drawable/${LARGE_RESOURCE_NAME}`,
      'resource',
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      META_DATA_SMALL_ICON,
      `@drawable/${SMALL_RESOURCE_NAME}`,
      'resource',
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      META_DATA_ICON_COLOR,
      `@color/${ICON_COLOR_NAME}`,
      'resource',
    );
    return modConfig;
  });

  // Register last so these files overwrite expo-notifications' color PNG.
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      await generateAndroidNotificationIcons(modConfig.modRequest.projectRoot);
      return modConfig;
    },
  ]);
};

module.exports = withNotificationLargeIcon;
module.exports.generateAndroidNotificationIcons = generateAndroidNotificationIcons;
