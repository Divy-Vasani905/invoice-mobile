/* eslint-disable react-hooks/immutability -- Reanimated shared values are designed to be mutated in gesture worklets */
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showToast } from '@/components/feedback/Toast';
import { cStyle, useTheme } from '@/theme';

import { cropBusinessImage } from '../utils/crop-business-image';
import { setCropResult } from '../utils/crop-result';

import type { BusinessAssetKind } from '../types/business.types';

type RotationAngle = 0 | 90 | 180 | 270;

export function CropBusinessImageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const params = useLocalSearchParams<{ imageUri?: string; kind?: BusinessAssetKind }>();
  const imageUri = params.imageUri;
  const kind: BusinessAssetKind = params.kind === 'signature' ? 'signature' : 'logo';

  const [rawSize, setRawSize] = useState<{ width: number; height: number } | null>(null);
  const [rotation, setRotation] = useState<RotationAngle>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reanimated shared values for zoom (scale) and pan (translation)
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Aspect ratio based on image kind: Logo 1:1, Signature 3:1
  const targetAspectRatio = kind === 'signature' ? 3 : 1;

  // Calculate crop frame dimensions on screen
  const headerHeight = 60;
  const bottomBarHeight = 120;
  const availableWidth = Math.max(100, windowWidth - 48);
  const availableHeight = Math.max(
    100,
    windowHeight - headerHeight - bottomBarHeight - insets.top - insets.bottom - 48,
  );

  const { frameWidth, frameHeight } = useMemo(() => {
    let w = availableWidth;
    let h = w / targetAspectRatio;
    if (h > availableHeight) {
      h = availableHeight;
      w = h * targetAspectRatio;
    }
    return { frameWidth: Math.round(w), frameHeight: Math.round(h) };
  }, [availableWidth, availableHeight, targetAspectRatio]);

  // Load raw image dimensions
  useEffect(() => {
    if (imageUri == null || imageUri.length === 0) return;
    RNImage.getSize(
      imageUri,
      (width, height) => setRawSize({ width, height }),
      () => {
        showToast('error', { title: 'Could not load image details' });
        router.back();
      },
    );
  }, [imageUri, router]);

  // Compute effective image size after rotation
  const { effWidth, effHeight } = useMemo(() => {
    if (rawSize == null) return { effWidth: 1, effHeight: 1 };
    if (rotation === 90 || rotation === 270) {
      return { effWidth: rawSize.height, effHeight: rawSize.width };
    }
    return { effWidth: rawSize.width, effHeight: rawSize.height };
  }, [rawSize, rotation]);

  // Base scale required to completely fill crop frame
  const baseScale = useMemo(() => {
    if (effWidth <= 0 || effHeight <= 0) return 1;
    return Math.max(frameWidth / effWidth, frameHeight / effHeight);
  }, [effWidth, effHeight, frameWidth, frameHeight]);

  const dispWidth = effWidth * baseScale;
  const dispHeight = effHeight * baseScale;

  const clampTranslation = useCallback(
    (tx: number, ty: number, currentScale: number) => {
      'worklet';
      const maxTx = Math.max(0, (dispWidth * currentScale - frameWidth) / 2);
      const maxTy = Math.max(0, (dispHeight * currentScale - frameHeight) / 2);

      const clampedX = Math.min(maxTx, Math.max(-maxTx, tx));
      const clampedY = Math.min(maxTy, Math.max(-maxTy, ty));

      return { clampedX, clampedY };
    },
    [dispWidth, dispHeight, frameWidth, frameHeight],
  );

  const resetTransform = useCallback(() => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    savedTranslateX.value = 0;
    translateY.value = withTiming(0);
    savedTranslateY.value = 0;
  }, [scale, savedScale, translateX, savedTranslateX, translateY, savedTranslateY]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => {
      const next = (prev + 90) % 360;
      return next as RotationAngle;
    });
    runOnUI(resetTransform)();
  }, [resetTransform]);

  // Gestures: Pinch & Pan
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      'worklet';
      const newScale = Math.min(5, Math.max(1, savedScale.value * e.scale));
      scale.value = newScale;
      const { clampedX, clampedY } = clampTranslation(translateX.value, translateY.value, newScale);
      translateX.value = clampedX;
      translateY.value = clampedY;
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
      const { clampedX, clampedY } = clampTranslation(
        translateX.value,
        translateY.value,
        scale.value,
      );
      translateX.value = clampedX;
      translateY.value = clampedY;
      savedTranslateX.value = clampedX;
      savedTranslateY.value = clampedY;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      const rawX = savedTranslateX.value + e.translationX;
      const rawY = savedTranslateY.value + e.translationY;
      const { clampedX, clampedY } = clampTranslation(rawX, rawY, scale.value);
      translateX.value = clampedX;
      translateY.value = clampedY;
    })
    .onEnd(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation}deg` },
    ],
  }));

  const handleDone = async () => {
    if (imageUri == null || rawSize == null || isProcessing) return;

    try {
      setIsProcessing(true);

      const s = scale.value;
      const tx = translateX.value;
      const ty = translateY.value;

      const totalScale = baseScale * s;
      const renderedWidth = effWidth * totalScale;
      const renderedHeight = effHeight * totalScale;

      const frameXInRendered = (renderedWidth - frameWidth) / 2 - tx;
      const frameYInRendered = (renderedHeight - frameHeight) / 2 - ty;

      const rawOriginX = frameXInRendered / totalScale;
      const rawOriginY = frameYInRendered / totalScale;
      const rawCropW = frameWidth / totalScale;
      const rawCropH = frameHeight / totalScale;

      const originX = Math.max(0, Math.min(rawOriginX, effWidth - rawCropW));
      const originY = Math.max(0, Math.min(rawOriginY, effHeight - rawCropH));
      const cropW = Math.min(rawCropW, effWidth - originX);
      const cropH = Math.min(rawCropH, effHeight - originY);

      const result = await cropBusinessImage({
        sourceUri: imageUri,
        cropRect: {
          originX: Math.round(originX),
          originY: Math.round(originY),
          width: Math.round(cropW),
          height: Math.round(cropH),
        },
        rotation,
      });

      setCropResult({ uri: result.uri, kind });
      router.back();
    } catch (err) {
      showToast('error', {
        title: 'Crop failed',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (imageUri == null || rawSize == null) {
    return (
      <View
        style={[
          cStyle.flex1,
          cStyle.itemCenter,
          cStyle.justifyCenter,
          { backgroundColor: '#000000' },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Pre-calculated display size before rotation is applied in transform
  // Notice: rawSize is used for base Image element dimensions, while effWidth/effHeight determine scale
  const rawBaseScale = Math.max(frameWidth / rawSize.width, frameHeight / rawSize.height);
  const baseImgW = rawSize.width * rawBaseScale;
  const baseImgH = rawSize.height * rawBaseScale;

  return (
    <View style={[cStyle.flex1, { backgroundColor: '#0A0C10' }]}>
      <View style={[cStyle.flex1, cStyle.itemCenter, cStyle.justifyCenter, { overflow: 'hidden' }]}>
        {/* Gesture container over full preview area */}
        <GestureDetector gesture={composedGesture}>
          <View style={[StyleSheet.absoluteFill, cStyle.itemCenter, cStyle.justifyCenter]}>
            <Animated.Image
              source={{ uri: imageUri }}
              style={[
                {
                  width: baseImgW,
                  height: baseImgH,
                },
                animatedImageStyle,
              ]}
              resizeMode="cover"
            />

            {/* Dark Mask Overlay outside crop frame */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)' }} />
              <View style={[cStyle.flexRow, { height: frameHeight }]}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)' }} />
                <View
                  style={{
                    width: frameWidth,
                    height: frameHeight,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                  }}
                >
                  {/* Grid overlay lines */}
                  <View style={[StyleSheet.absoluteFill, cStyle.justifyEvenly]}>
                    <View style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                    <View style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                  </View>
                  <View style={[StyleSheet.absoluteFill, cStyle.flexRow, cStyle.justifyEvenly]}>
                    <View style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                    <View style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                  </View>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)' }} />
              </View>
              <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)' }} />
            </View>
          </View>
        </GestureDetector>
      </View>

      {/* Bottom controls */}
      <View
        style={[
          cStyle.ph24,
          cStyle.pv16,
          cStyle.itemCenter,
          cStyle.g16,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: '#12161F',
            borderTopWidth: 1,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[theme.typography.helper, { color: theme.colors.textSecondary }]}>
          Pinch to zoom • Drag to position
        </Text>
        <View style={[cStyle.flexRow, cStyle.g24]}>
          <Pressable
            onPress={handleRotate}
            style={({ pressed }) => [
              cStyle.flexRow,
              cStyle.itemCenter,
              cStyle.g8,
              cStyle.ph16,
              cStyle.pv8,
              cStyle.r20,
              { backgroundColor: theme.colors.surface, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.colors.textPrimary} />
            <Text style={[theme.typography.button, { color: theme.colors.textPrimary }]}>
              Rotate 90°
            </Text>
          </Pressable>

          <Pressable
            onPress={() => runOnUI(resetTransform)()}
            style={({ pressed }) => [
              cStyle.flexRow,
              cStyle.itemCenter,
              cStyle.g8,
              cStyle.ph16,
              cStyle.pv8,
              cStyle.r20,
              { backgroundColor: theme.colors.surface, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="reload-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={[theme.typography.button, { color: theme.colors.textSecondary }]}>
              Reset
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={handleDone}
          disabled={isProcessing}
          style={({ pressed }) => [
            cStyle.ph24,
            cStyle.pv12,
            cStyle.r32,
            {
              backgroundColor: theme.colors.primary,
              opacity: pressed || isProcessing ? 0.7 : 1,
            },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[theme.typography.button, { color: '#FFFFFF' }]}>Done</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
