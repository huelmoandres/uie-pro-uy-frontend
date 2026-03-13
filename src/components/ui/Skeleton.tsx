import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export const Skeleton = ({
  width,
  height,
  borderRadius = 8,
  className,
}: SkeletonProps) => {
  // A smoother, premium pulse using Reanimated's withTiming
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      className={`overflow-hidden bg-slate-200 dark:bg-slate-700/50 ${className || ""}`}
      style={{ width: width as any, height: height as any, borderRadius }}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          animatedStyle,
          { backgroundColor: "rgba(255, 255, 255, 0.4)" },
        ]}
      />
    </View>
  );
};

export const ExpedienteSkeleton = () => (
  <View className="mb-4 overflow-hidden rounded-[28px] bg-white p-6 border border-slate-100 shadow-premium dark:bg-[#0B1120] dark:border-white/5">
    {/* Header */}
    <View className="flex-row items-center mb-5">
      <Skeleton width={48} height={48} borderRadius={16} />
      <View className="ml-4 flex-1">
        <Skeleton width={70} height={12} borderRadius={4} className="mb-2" />
        <Skeleton width="80%" height={16} borderRadius={6} />
      </View>
    </View>

    {/* Title/Caratula */}
    <Skeleton width="100%" height={24} borderRadius={8} className="mb-6" />

    {/* Footer/Meta */}
    <View className="flex-row items-center justify-between border-t border-slate-50 pt-4 dark:border-white/5">
      <Skeleton width={120} height={14} borderRadius={4} />
      <Skeleton width={60} height={20} borderRadius={10} />
    </View>
  </View>
);
