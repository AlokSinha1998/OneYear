import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { THEMES, ThemeKey } from '../../../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

type ThemeSelectorModalProps = {
    visible: boolean;
    onClose: () => void;
};

const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ visible, onClose }) => {
    const { theme, setTheme } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.sheet, { backgroundColor: theme.menuBg }]}>
                    <View style={styles.handle} />

                    <Text style={[styles.title, { color: theme.menuText }]}>🎨  Choose Theme</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {(Object.keys(THEMES) as ThemeKey[]).map(key => {
                            const t = THEMES[key];
                            const isActive = theme.key === key;

                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.themeRow,
                                        {
                                            borderColor: isActive ? '#F59E0B' : 'transparent',
                                            borderWidth: isActive ? 2 : 0,
                                            backgroundColor: isActive
                                                ? 'rgba(245, 158, 11, 0.1)'
                                                : 'rgba(128,128,128,0.07)',
                                        },
                                    ]}
                                    activeOpacity={0.75}
                                    onPress={() => setTheme(key)}
                                >
                                    {/* Dot preview row */}
                                    <View style={styles.dotPreview}>
                                        {t.dotPalette.slice(0, 5).map((colors, idx) => (
                                            <LinearGradient
                                                key={idx}
                                                colors={colors}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={[
                                                    styles.previewDot,
                                                    { backgroundColor: t.background },
                                                ]}
                                            />
                                        ))}
                                    </View>

                                    <Text style={[styles.themeName, { color: theme.menuText }]}>
                                        {t.name}
                                    </Text>

                                    {isActive && (
                                        <Text style={styles.activeCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={[styles.closeBtnText, { color: theme.menuText }]}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ThemeSelectorModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 32,
        maxHeight: '80%',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ccc',
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    dotPreview: {
        flexDirection: 'row',
        marginRight: 14,
        gap: 5,
    },
    previewDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    themeName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    activeCheck: {
        fontSize: 20,
        color: '#F59E0B',
        fontWeight: '700',
    },
    closeBtn: {
        marginTop: 8,
        paddingVertical: 14,
        backgroundColor: '#F59E0B',
        borderRadius: 50,
        alignItems: 'center',
    },
    closeBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
