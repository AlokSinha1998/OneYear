import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

type RateUsModalProps = {
    visible: boolean;
    onRate: () => void;
    onDismiss: () => void;
};

const PLAY_STORE_URL = 'market://details?id=com.oneyear';
const APP_STORE_URL = 'itms-apps://itunes.apple.com/app/id0000000000';

const RateUsModal: React.FC<RateUsModalProps> = ({ visible, onRate, onDismiss }) => {
    const { theme } = useTheme();

    const handleRate = () => {
        Linking.canOpenURL(PLAY_STORE_URL)
            .then(supported => {
                const url = supported ? PLAY_STORE_URL : `https://play.google.com/store/apps/details?id=com.oneyear`;
                return Linking.openURL(url);
            })
            .catch(() => Linking.openURL(APP_STORE_URL));
        onRate();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: theme.menuBg }]}>
                    {/* Stars */}
                    <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>

                    <Text style={[styles.title, { color: theme.menuText }]}>
                        Enjoying OneYear?
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.menuText, opacity: 0.6 }]}>
                        Your review helps others discover the app and keeps us motivated to build more!
                    </Text>

                    <TouchableOpacity
                        style={styles.rateButton}
                        activeOpacity={0.85}
                        onPress={handleRate}
                    >
                        <Text style={styles.rateButtonText}>⭐  Rate Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dismissButton}
                        onPress={onDismiss}
                    >
                        <Text style={[styles.dismissText, { color: theme.menuText, opacity: 0.5 }]}>
                            Not Now
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default RateUsModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    card: {
        borderRadius: 24,
        padding: 28,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    stars: {
        fontSize: 32,
        marginBottom: 16,
        letterSpacing: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    rateButton: {
        backgroundColor: '#F59E0B',
        paddingVertical: 13,
        paddingHorizontal: 40,
        borderRadius: 50,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    rateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    dismissButton: {
        paddingVertical: 8,
    },
    dismissText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
