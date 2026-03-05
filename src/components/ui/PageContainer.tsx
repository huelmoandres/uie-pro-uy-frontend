import React from 'react';
import { View, ScrollView, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface PageContainerProps extends ViewProps {
    children: React.ReactNode;
    scrollable?: boolean;
    withHeader?: boolean;
    keyboardAware?: boolean;
}

/**
 * Standardized container for application pages.
 * Enforces Rule 12 and consistent padding.
 * Handles keyboard avoiding and auto-scroll when requested.
 * Uses Premium Background tokens.
 */
export function PageContainer({
    children,
    scrollable = false,
    withHeader = false,
    keyboardAware = false,
    className = '',
    ...props
}: PageContainerProps) {
    const insets = useSafeAreaInsets();

    // Decide which container to use
    let Container: any = View;
    if (keyboardAware) {
        Container = KeyboardAwareScrollView;
    } else if (scrollable) {
        Container = ScrollView;
    }

    // Rule: Standard horizontal padding is px-6
    const baseClassName = `flex-1 px-6 ${className}`;

    // Standard spacing logic
    const contentContainerStyle = (scrollable || keyboardAware) ? {
        flexGrow: 1,
        paddingTop: withHeader ? 0 : insets.top,
        paddingBottom: insets.bottom + 40
    } : {
        paddingTop: withHeader ? 0 : insets.top,
        paddingBottom: insets.bottom
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <Container
                className={baseClassName}
                contentContainerStyle={contentContainerStyle}
                // KeyboardAwareScrollView specific props
                enableOnAndroid={true}
                extraScrollHeight={50}
                keyboardShouldPersistTaps="handled"
                {...props}
            >
                {children}
            </Container>
        </View>
    );
}
