import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Scale } from 'lucide-react-native';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

/**
 * A full-screen, semi-transparent overlay to block user interaction
 * during critical async operations (like OTA updates).
 */
export function LoadingOverlay({ visible, message = 'Cargando...' }: LoadingOverlayProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        if (visible) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            opacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            scale.value = 1;
            opacity.value = 0.5;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    if (!visible) return null;

    return (
        <View className="absolute inset-0 z-50 items-center justify-center bg-background-light/80 backdrop-blur-md dark:bg-background-dark/90">
            <View className="items-center rounded-[32px] bg-white px-8 py-8 shadow-premium dark:bg-primary dark:shadow-premium-dark border border-slate-100 dark:border-white/10">
                <Animated.View style={animatedStyle} className="h-16 w-16 items-center justify-center rounded-[24px] bg-accent/10 mb-2">
                    <Scale size={32} color="#B89146" />
                </Animated.View>
                <Text className="mt-4 text-center font-sans-semi text-slate-800 dark:text-slate-200">
                    {message}
                </Text>
            </View>
        </View>
    );
}
