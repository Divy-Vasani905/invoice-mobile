const { existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');

const {
  AndroidConfig,
  withAndroidManifest,
  withAndroidColors,
  withDangerousMod,
} = require('@expo/config-plugins');
const { generateImageAsync } = require('@expo/image-utils');
const { PNG } = require('pngjs');

const LARGE_ICON_SRC = './assets/images/icon-with-bg.png';
const SMALL_ICON_SRC = './assets/images/notification-icon.png';
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

function isNearWhite(r, g, b, a) {
  return a < 16 || (r > 245 && g > 245 && b > 245);
}

function cropToOpaqueContent(pngBuffer) {
  const image = PNG.sync.read(pngBuffer);
  let minX = image.width;
  let minY = image.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const i = (image.width * y + x) << 2;
      if (isNearWhite(image.data[i], image.data[i + 1], image.data[i + 2], image.data[i + 3])) {
        continue;
      }
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    return pngBuffer;
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(image.width - 1, maxX + pad);
  maxY = Math.min(image.height - 1, maxY + pad);

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const cropped = new PNG({ width, height });

  PNG.bitblt(image, cropped, minX, minY, width, height, 0, 0);
  return PNG.sync.write(cropped);
}

function toDarkSilhouette(pngBuffer) {
  const image = PNG.sync.read(pngBuffer);
  for (let i = 0; i < image.data.length; i += 4) {
    if (isNearWhite(image.data[i], image.data[i + 1], image.data[i + 2], image.data[i + 3])) {
      image.data[i] = 0;
      image.data[i + 1] = 0;
      image.data[i + 2] = 0;
      image.data[i + 3] = 0;
    } else {
      image.data[i] = 0;
      image.data[i + 1] = 0;
      image.data[i + 2] = 0;
      image.data[i + 3] = 255;
    }
  }
  return PNG.sync.write(image);
}

async function writeSmallNotificationIcons(projectRoot, resRoot) {
  const { source } = await generateImageAsync(
    { projectRoot, cacheType: 'android-notification-small-source' },
    {
      src: SMALL_ICON_SRC,
      width: 512,
      height: 512,
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },
  );

  const croppedPath = join(tmpdir(), 'eim-notification-icon-cropped.png');
  writeFileSync(croppedPath, cropToOpaqueContent(source));

  for (const [folderName, size] of Object.entries(SMALL_ICON_SIZES)) {
    const folderPath = resolve(resRoot, folderName);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    const resized = await generateImageAsync(
      { projectRoot, cacheType: 'android-notification-small' },
      {
        src: croppedPath,
        width: size,
        height: size,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
      },
    );

    writeFileSync(
      resolve(folderPath, `${SMALL_RESOURCE_NAME}.png`),
      toDarkSilhouette(resized.source),
    );
  }
}

async function writeLargeNotificationIcons(projectRoot, resRoot) {
  for (const [folderName, size] of Object.entries(LARGE_ICON_SIZES)) {
    const folderPath = resolve(resRoot, folderName);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    const { source } = await generateImageAsync(
      { projectRoot, cacheType: 'android-notification-large' },
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
 * - small icon: cropped logo silhouette in a white circle
 *
 * @type {import('@expo/config-plugins').ConfigPlugin}
 */
const withNotificationLargeIcon = (config) => {
  config = withDangerousMod(config, [
    'android',
    async (modConfig) => {
      await generateAndroidNotificationIcons(modConfig.modRequest.projectRoot);
      return modConfig;
    },
  ]);

  config = withAndroidColors(config, (modConfig) => {
    modConfig.modResults = AndroidConfig.Colors.assignColorValue(modConfig.modResults, {
      name: ICON_COLOR_NAME,
      value: ICON_COLOR_VALUE,
    });
    return modConfig;
  });

  return withAndroidManifest(config, (modConfig) => {
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
};

module.exports = withNotificationLargeIcon;
module.exports.generateAndroidNotificationIcons = generateAndroidNotificationIcons;
