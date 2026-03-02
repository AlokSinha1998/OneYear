/**
 * NotificationSettingsModal.tsx
 *
 * Bottom-sheet modal to toggle daily notifications and pick a time.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import {
    requestNotifPermission,
    scheduleDailyNotification,
    cancelDailyNotification,
    isNotifEnabled,
    getNotifHour,
    getNotifMinute,
} from '../../../services/NotificationService';

type Props = { visible: boolean; onClose: () => void; };

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const fmt2 = (n: number) => String(n).padStart(2, '0');
const ampm = (h: number) => (h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`);

const NotificationSettingsModal: React.FC<Props> = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const [enabled, setEnabled] = useState(isNotifEnabled);
    const [hour, setHour] = useState(getNotifHour);
    const [minute, setMinute] = useState(getNotifMinute);
    const [saving, setSaving] = useState(false);

    const handleToggle = async (val: boolean) => {
        setEnabled(val);
        if (!val) {
            await cancelDailyNotification();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        if (enabled) {
            const granted = await requestNotifPermission();
            if (!granted) {
                Alert.alert(
                    'Permission Required',
                    'Please allow notifications in your device settings to enable daily reminders.',
                );
                setSaving(false);
                return;
            }
            await scheduleDailyNotification(hour, minute);
        } else {
            await cancelDailyNotification();
        }
        setSaving(false);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.sheet, { backgroundColor: theme.menuBg }]}>
                    <View style={styles.handle} />
                    <Text style={[styles.title, { color: theme.menuText }]}>🔔  Daily Reminder</Text>

                    {/* Toggle */}
                    <View style={[styles.row, { backgroundColor: `${theme.background}80` }]}>
                        <View>
                            <Text style={[styles.rowLabel, { color: theme.menuText }]}>Enable Daily Notification</Text>
                            <Text style={[styles.rowSub, { color: theme.menuText }]}>
                                Get a daily progress motivator
                            </Text>
                        </View>
                        <Switch
                            value={enabled}
                            onValueChange={handleToggle}
                            trackColor={{ false: '#555', true: '#F59E0B' }}
                            thumbColor="#fff"
                        />
                    </View>

                    {enabled && (
                        <>
                            <Text style={[styles.sectionLabel, { color: theme.menuText }]}>Notify me at</Text>

                            {/* Hour picker */}
                            <Text style={[styles.pickerLabel, { color: theme.menuText, opacity: 0.5 }]}>HOUR</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                                {HOURS.map(h => (
                                    <TouchableOpacity
                                        key={h}
                                        style={[styles.chip, hour === h && styles.chipActive]}
                                        onPress={() => setHour(h)}
                                    >
                                        <Text style={[styles.chipText, hour === h && styles.chipTextActive]}>
                                            {ampm(h)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Minute picker */}
                            <Text style={[styles.pickerLabel, { color: theme.menuText, opacity: 0.5 }]}>MINUTE</Text>
                            <View style={styles.minuteRow}>
                                {MINUTES.map(m => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[styles.chip, minute === m && styles.chipActive]}
                                        onPress={() => setMinute(m)}
                                    >
                                        <Text style={[styles.chipText, minute === m && styles.chipTextActive]}>
                                            :{fmt2(m)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.previewBox}>
                                <Text style={[styles.previewText, { color: theme.menuText }]}>
                                    Daily reminder at{' '}
                                    <Text style={{ color: '#F59E0B', fontWeight: '700' }}>
                                        {ampm(hour)} :{fmt2(minute)}
                                    </Text>
                                </Text>
                            </View>
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={[styles.cancelText, { color: theme.menuText, opacity: 0.4 }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default NotificationSettingsModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 36,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 16,
    },
    title: {
        fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 20,
    },
    row: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: 16,
        borderRadius: 14, marginBottom: 20,
    },
    rowLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    rowSub: { fontSize: 12, opacity: 0.5 },
    sectionLabel: {
        fontSize: 16, fontWeight: '600', marginBottom: 10,
    },
    pickerLabel: {
        fontSize: 11, fontWeight: '700',
        letterSpacing: 1, marginBottom: 6, marginTop: 8,
    },
    pickerRow: { marginBottom: 4 },
    minuteRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, backgroundColor: 'rgba(128,128,128,0.1)',
        marginRight: 8,
    },
    chipActive: { backgroundColor: '#F59E0B' },
    chipText: { fontSize: 13, fontWeight: '500', color: '#888' },
    chipTextActive: { color: '#fff', fontWeight: '700' },
    previewBox: {
        marginTop: 12, marginBottom: 8,
        padding: 12, borderRadius: 12,
        backgroundColor: 'rgba(245,158,11,0.1)',
        alignItems: 'center',
    },
    previewText: { fontSize: 14 },
    saveBtn: {
        marginTop: 16, paddingVertical: 14,
        backgroundColor: '#F59E0B', borderRadius: 50, alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    cancelBtn: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
    cancelText: { fontSize: 14, fontWeight: '500' },
});
