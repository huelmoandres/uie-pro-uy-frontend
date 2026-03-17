import React, { forwardRef } from "react";
import { View, ScrollView, ViewProps, ScrollViewProps, KeyboardAvoidingView } from "react-native";
import { KEYBOARD_AVOIDING_VIEW_PROPS } from "@utils/keyboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PageContainerProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withHeader?: boolean;
  keyboardAware?: boolean;
  refreshControl?: ScrollViewProps["refreshControl"];
}

/**
 * Standardized container for application pages.
 * Enforces Rule 12 and consistent padding.
 * Handles keyboard avoiding and auto-scroll when requested.
 * Uses KeyboardAvoidingView + ScrollView instead of KeyboardAwareScrollView
 * to avoid viewIsDescendantOf() errors in modals/sheets.
 * Con keyboardAware, ref apunta al ScrollView para scrollTo/scrollToEnd.
 */
export const PageContainer = forwardRef<ScrollView, PageContainerProps>(function PageContainer({
  children,
  scrollable = false,
  withHeader = false,
  keyboardAware = false,
  refreshControl,
  className = "",
  ...props
}, ref) {
  const insets = useSafeAreaInsets();

  // Rule: Standard horizontal padding is px-6
  const baseClassName = `flex-1 px-6 ${className}`;

  // Standard spacing logic
  const contentContainerStyle =
    scrollable || keyboardAware
      ? {
          flexGrow: 1,
          paddingTop: withHeader ? 0 : insets.top,
          paddingBottom: insets.bottom + 40,
        }
      : {
          paddingTop: withHeader ? 0 : insets.top,
          paddingBottom: insets.bottom,
        };

  const scrollProps =
    scrollable || keyboardAware
      ? {
          contentContainerStyle,
          showsVerticalScrollIndicator: false,
          keyboardShouldPersistTaps: "handled" as const,
        }
      : {};

  if (keyboardAware) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <KeyboardAvoidingView
          {...KEYBOARD_AVOIDING_VIEW_PROPS}
          className="flex-1"
        >
          <ScrollView
            ref={ref}
            className={baseClassName}
            {...scrollProps}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  if (scrollable) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <ScrollView
          ref={ref}
          className={baseClassName}
          {...scrollProps}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 bg-background-light dark:bg-background-dark ${baseClassName}`}
      style={{
        paddingTop: withHeader ? 0 : insets.top,
        paddingBottom: insets.bottom,
      }}
      {...props}
    >
      {children}
    </View>
  );
});
