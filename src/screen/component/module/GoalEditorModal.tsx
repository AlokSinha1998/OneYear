/**
 * GoalEditorModal.tsx
 *
 * Shown when user long-presses (or taps "Add Goal") on a day dot.
 * Lets them set a label, pick an emoji and a color, then saves via useGoals.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { GOAL_COLORS, GOAL_EMOJIS, Goal } from '../../../hooks/useGoals';

type Props = {
    visible: boolean;
    dayIndex: number | null;
    year: number;
    existingGoal?: Goal;
    onSave: (dayIndex: number, label: string, emoji: string, color: string) => void;
    onDelete: (dayIndex: number) => void;
    onClose: () => void;
};

const getDayDate = (dayIndex: number, year: number) => {
    const d = new Date(year, 0, dayIndex);
    return d.toLocaleDateString('default', { month: 'long', day: 'numeric' });
};

const GoalEditorModal: React.FC<Props> = ({
    visible, dayIndex, year, existingGoal, onSave, onDelete, onClose,
}) => {
    const { theme } = useTheme();
    const [label, setLabel] = useState('');
    const [emoji, setEmoji] = useState(GOAL_EMOJIS[0]);
    const [color, setColor] = useState(GOAL_COLORS[0]);

    // Pre-fill when editing existing
    useEffect(() => {
        if (existingGoal) {
            setLabel(existingGoal.label);
            setEmoji(existingGoal.emoji);
            setColor(existingGoal.color);
        } else {
            setLabel('');
            setEmoji(GOAL_EMOJIS[0]);
            setColor(GOAL_COLORS[0]);
        }
    }, [existingGoal, visible]);

    if (dayIndex === null) return null;

    const handleSave = () => {
        if (!label.trim()) return;
        onSave(dayIndex, label.trim(), emoji, color);
        onClose();
    };

    const handleDelete = () => {
        onDelete(dayIndex);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.sheet, { backgroundColor: theme.menuBg }]}
                    >
                        <View style={styles.handle} />

                        {/* Header */}
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={[styles.title, { color: theme.menuText }]}>
                                    {existingGoal ? 'Edit Milestone' : 'Add Milestone'}
                                </Text>
                                <Text style={[styles.subtitle, { color: theme.menuText }]}>
                                    {getDayDate(dayIndex, year)}
                                </Text>
                            </View>
                            {existingGoal && (
                                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                                    <Text style={styles.deleteBtnText}>🗑 Remove</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Emoji picker */}
                        <Text style={[styles.sectionLabel, { color: theme.menuText }]}>Icon</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
                            {GOAL_EMOJIS.map(e => (
                                <TouchableOpacity
                                    key={e}
                                    style={[styles.emojiChip, emoji === e && { backgroundColor: `${color}33`, borderColor: color, borderWidth: 2 }]}
                                    onPress={() => setEmoji(e)}
                                >
                                    <Text style={styles.emojiText}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Color picker */}
                        <Text style={[styles.sectionLabel, { color: theme.menuText }]}>Color</Text>
                        <View style={styles.colorRow}>
                            {GOAL_COLORS.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[
                                        styles.colorChip,
                                        { backgroundColor: c },
                                        color === c && styles.colorChipActive,
                                    ]}
                                    onPress={() => setColor(c)}
                                >
                                    {color === c && <Text style={styles.colorCheck}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Label input */}
                        <Text style={[styles.sectionLabel, { color: theme.menuText }]}>Label</Text>
                        <TextInput
                            style={[styles.input, { color: theme.menuText, borderColor: color }]}
                            placeholder="e.g. My Birthday 🎂"
                            placeholderTextColor={`${theme.menuText}55`}
                            value={label}
                            onChangeText={setLabel}
                            maxLength={30}
                            returnKeyType="done"
                            onSubmitEditing={handleSave}
                        />

                        {/* Preview */}
                        <View style={[styles.preview, { backgroundColor: `${color}20`, borderColor: `${color}60` }]}>
                            <Text style={styles.previewEmoji}>{emoji}</Text>
                            <Text style={[styles.previewLabel, { color }]}>{label || 'Your milestone here'}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: color, opacity: label.trim() ? 1 : 0.4 }]}
                            onPress={handleSave}
                            disabled={!label.trim()}
                        >
                            <Text style={styles.saveBtnText}>
                                {existingGoal ? 'Update Milestone' : 'Save Milestone'}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default GoalEditorModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 16,
    },
    title: { fontSize: 20, fontWeight: '700' },
    subtitle: { fontSize: 13, opacity: 0.5, marginTop: 2 },
    deleteBtn: {
        backgroundColor: 'rgba(239,68,68,0.12)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    deleteBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
    sectionLabel: {
        fontSize: 11, fontWeight: '700', letterSpacing: 1,
        textTransform: 'uppercase', opacity: 0.5, marginBottom: 8,
    },
    emojiRow: { marginBottom: 16 },
    emojiChip: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(128,128,128,0.1)',
        justifyContent: 'center', alignItems: 'center', marginRight: 8,
    },
    emojiText: { fontSize: 22 },
    colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
    colorChip: {
        width: 34, height: 34, borderRadius: 17,
        justifyContent: 'center', alignItems: 'center',
    },
    colorChipActive: {
        borderWidth: 3, borderColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
    },
    colorCheck: { color: '#fff', fontSize: 16, fontWeight: '700' },
    input: {
        borderWidth: 1.5, borderRadius: 12, padding: 12,
        fontSize: 15, marginBottom: 14, backgroundColor: 'rgba(128,128,128,0.07)',
    },
    preview: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        borderRadius: 12, borderWidth: 1, marginBottom: 16, gap: 10,
    },
    previewEmoji: { fontSize: 24 },
    previewLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
    saveBtn: {
        paddingVertical: 14, borderRadius: 50, alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
