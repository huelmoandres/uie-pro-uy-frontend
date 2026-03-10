import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';

const LEGAL_BASE_URL = 'https://iueprouy.com';
const PRIVACY_URL = `${LEGAL_BASE_URL}/privacy-policy.html`;
const TERMS_URL = `${LEGAL_BASE_URL}/terms.html`;

export function PaywallLegal() {
    const openUrl = (url: string) => {
        void Linking.openURL(url);
    };

    return (
        <View className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
            <Text className="text-[11px] font-sans text-slate-400 dark:text-slate-500 text-center mb-3">
                Al suscribirte, aceptás nuestros términos y política de
                privacidad.
            </Text>
            <View className="flex-row justify-center gap-6">
                <Pressable onPress={() => openUrl(PRIVACY_URL)}>
                    <Text className="text-[12px] font-sans-semi text-accent">
                        Política de Privacidad
                    </Text>
                </Pressable>
                <Pressable onPress={() => openUrl(TERMS_URL)}>
                    <Text className="text-[12px] font-sans-semi text-accent">
                        Términos de Uso
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
