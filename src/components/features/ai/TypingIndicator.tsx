import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Bot } from "lucide-react-native";
import { COLORS } from "@/constants/Colors";

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: withTiming(opacity.value > 0.6 ? -2 : 0, { duration: 200 }),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: COLORS.slate[400],
          marginHorizontal: 2,
          marginTop: delay * 100,
        },
      ]}
    />
  );
}

export function TypingIndicator() {
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className="flex-row items-center px-4 py-2"
    >
      <View className="w-7 h-7 rounded-full bg-primary/10 dark:bg-white/10 items-center justify-center mr-2">
        <Bot size={14} color={COLORS.accent} />
      </View>
      <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm">
        <TypingDot delay={0} />
        <TypingDot delay={1} />
        <TypingDot delay={2} />
      </View>
    </Animated.View>
  );
}
