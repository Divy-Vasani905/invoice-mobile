import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { cStyle } from '@/theme';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  const image = <Image style={imageStyle} source={require('@/assets/images/expo-logo.png')} />;

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={[splashOverlayStyle, cStyle.itemCenter, cStyle.justifyCenter, cStyle.z1000]}
    >
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={[splashOverlayStyle, cStyle.itemCenter, cStyle.justifyCenter, cStyle.z1000]}
    >
      {image}
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={[iconContainerStyle, cStyle.justifyCenter, cStyle.itemCenter, cStyle.z100]}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={glowStyle}>
        <Image style={glowStyle} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={backgroundStyle} />
      <Animated.View
        style={[cStyle.justifyCenter, cStyle.itemCenter]}
        entering={logoKeyframe.duration(DURATION)}
      >
        <Image style={imageStyle} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const glowStyle = { width: 201, height: 201, position: 'absolute' } as const;
const iconContainerStyle = { width: 128, height: 128 } as const;
const imageStyle = { width: 76, height: 71 } as const;
const backgroundStyle = {
  borderRadius: 40,
  experimental_backgroundImage: 'linear-gradient(180deg, #3C9FFE, #0274DF)',
  width: 128,
  height: 128,
  position: 'absolute',
} as const;
const splashOverlayStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: '#208AEF',
} as const;
