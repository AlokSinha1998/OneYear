/**
 * CountdownsScreen.tsx — Premium redesign
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    Alert,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import {
    useCountdowns,
    getDaysLeft,
    COUNTDOWN_EMOJIS,
    COUNTDOWN_COLORS,
    Countdown,
} from '../hooks/useCountdowns';

type Props = { visible: boolean; onClose: () => void; };

/* ─────────────────────────────────
   CARD
───────────────────────────────── */
const CountdownCard: React.FC<{
    item: Countdown;
    onDelete: () => void;
}> = ({ item, onDelete }) => {
    const days = getDaysLeft(item.targetDate);
    const dateStr = new Date(item.targetDate).toLocaleDateString('default', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
    const isPast = days < 0;
    const isToday = days === 0;

    const statusLabel = isToday ? 'TODAY! 🎉' : isPast ? 'PASSED' : 'DAYS LEFT';
    const bigNumber = isToday ? '🎉' : String(Math.abs(days));

    return (
        <View style={[styles.card, { shadowColor: item.color }]}>
            {/* Left accent stripe */}
            <View style={[styles.cardStripe, { backgroundColor: item.color }]} />

            {/* Icon box */}
            <LinearGradient
                colors={[`${item.color}40`, `${item.color}15`]}
                style={styles.cardIconBox}
            >
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
            </LinearGradient>

            {/* Body */}
            <View style={styles.cardBody}>
                <Text style={styles.cardLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.cardDate}>{dateStr}</Text>

                {/* Dots progress strip */}
                <View style={styles.cardDots}>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: i < Math.round((1 - Math.abs(days) / 365) * 10)
                                        ? item.color
                                        : 'rgba(255,255,255,0.12)',
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Right: big number + delete */}
            <View style={styles.cardRight}>
                <Text style={[styles.daysNumber, { color: isPast ? '#888' : item.color }]}>
                    {bigNumber}
                </Text>
                <Text style={[styles.daysLabel, { color: isPast ? '#666' : `${item.color}99` }]}>
                    {statusLabel}
                </Text>
                <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

/* ─────────────────────────────────
   ADD SHEET
───────────────────────────────── */
const AddCountdownSheet: React.FC<{
    onSave: (label: string, emoji: string, color: string, date: Date) => void;
    onClose: () => void;
    bg: string;
    textColor: string;
}> = ({ onSave, onClose, bg, textColor }) => {
    const [label, setLabel] = useState('');
    const [emoji, setEmoji] = useState(COUNTDOWN_EMOJIS[0]);
    const [color, setColor] = useState(COUNTDOWN_COLORS[0]);
    const [date, setDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d;
    });
    const [showPicker, setShowPicker] = useState(false);

    const handleSave = () => {
        if (!label.trim()) { Alert.alert('Please enter a label'); return; }
        onSave(label.trim(), emoji, color, date);
        onClose();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'flex-end' }}
        >
            <View style={[styles.addSheet, { backgroundColor: bg }]}>
                <View style={styles.sheetHandle} />
                <Text style={[styles.sheetTitle, { color: textColor }]}>Add Countdown</Text>

                {/* Emoji */}
                <Text style={[styles.fieldLabel, { color: textColor }]}>ICON</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    {COUNTDOWN_EMOJIS.map(e => (
                        <TouchableOpacity
                            key={e}
                            style={[
                                styles.emojiChip,
                                emoji === e && { backgroundColor: `${color}33`, borderColor: color, borderWidth: 2 },
                            ]}
                            onPress={() => setEmoji(e)}
                        >
                            <Text style={{ fontSize: 22 }}>{e}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Color */}
                <Text style={[styles.fieldLabel, { color: textColor }]}>COLOR</Text>
                <View style={styles.colorRow}>
                    {COUNTDOWN_COLORS.map(c => (
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

                {/* Label */}
                <Text style={[styles.fieldLabel, { color: textColor }]}>LABEL</Text>
                <TextInput
                    style={[styles.input, { color: textColor, borderColor: color }]}
                    placeholder="e.g. Trip to Japan ✈️"
                    placeholderTextColor={`${textColor}44`}
                    value={label}
                    onChangeText={setLabel}
                    maxLength={30}
                />

                {/* Date */}
                <Text style={[styles.fieldLabel, { color: textColor }]}>TARGET DATE</Text>
                <TouchableOpacity
                    style={[styles.dateBtn, { borderColor: color }]}
                    onPress={() => setShowPicker(true)}
                >
                    <Text style={{ fontSize: 20 }}>📅</Text>
                    <Text style={[styles.dateBtnText, { color: textColor }]}>
                        {date.toLocaleDateString('default', {
                            weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
                        })}
                    </Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={new Date()}
                        onChange={(_, selected) => {
                            setShowPicker(Platform.OS === 'ios');
                            if (selected) setDate(selected);
                        }}
                    />
                )}

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: color, opacity: label.trim() ? 1 : 0.4 }]}
                    onPress={handleSave}
                    disabled={!label.trim()}
                >
                    <Text style={styles.saveBtnText}>Add Countdown ✓</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

/* ─────────────────────────────────
   MAIN SCREEN
───────────────────────────────── */
const CountdownsScreen: React.FC<Props> = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const { countdowns, addCountdown, removeCountdown } = useCountdowns();
    const [showAdd, setShowAdd] = useState(false);

    const confirmDelete = (item: Countdown) => {
        Alert.alert('Remove Countdown', `Remove "${item.label}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeCountdown(item.id) },
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <View style={[styles.root, { backgroundColor: theme.background }]}>

                {/* ── GRADIENT HEADER ── */}
                <LinearGradient
                    colors={['#1a002e', '#0a001a']}
                    style={styles.header}
                >
                    <SafeAreaView>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>

                            <View style={styles.headerCenter}>
                                <Text style={styles.headerEmoji}>⏳</Text>
                                <Text style={styles.headerTitle}>Countdowns</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.addHeaderBtn}
                                onPress={() => setShowAdd(true)}
                            >
                                <Text style={styles.addHeaderBtnText}>+ Add</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Summary bar */}
                        <View style={styles.summaryBar}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNum}>{countdowns.length}</Text>
                                <Text style={styles.summaryLabel}>Total</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNum}>
                                    {countdowns.filter(c => getDaysLeft(c.targetDate) >= 0).length}
                                </Text>
                                <Text style={styles.summaryLabel}>Upcoming</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNum}>
                                    {countdowns.filter(c => getDaysLeft(c.targetDate) < 0).length}
                                </Text>
                                <Text style={styles.summaryLabel}>Passed</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>

                {/* ── LIST ── */}
                {countdowns.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>⏳</Text>
                        <Text style={[styles.emptyTitle, { color: theme.headerText }]}>
                            No countdowns yet
                        </Text>
                        <Text style={[styles.emptySub, { color: theme.subText }]}>
                            Add an upcoming event and track how many days until it arrives
                        </Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
                            <Text style={styles.emptyBtnText}>＋  Add your first countdown</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    >
                        {countdowns.map(c => (
                            <CountdownCard
                                key={c.id}
                                item={c}
                                onDelete={() => confirmDelete(c)}
                            />
                        ))}
                        {/* Footer breathing room */}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </View>

            {/* ── ADD SHEET ── */}
            <Modal
                visible={showAdd}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAdd(false)}
            >
                <TouchableOpacity
                    style={styles.sheetOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAdd(false)}
                >
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <AddCountdownSheet
                            bg={theme.menuBg}
                            textColor={theme.menuText}
                            onSave={addCountdown}
                            onClose={() => setShowAdd(false)}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </Modal>
    );
};

export default CountdownsScreen;

/* ─────────────────────────────────
   STYLES
───────────────────────────────── */
const styles = StyleSheet.create({
    root: { flex: 1 },

    /* Header */
    header: { paddingBottom: 16 },
    headerRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52,
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerEmoji: { fontSize: 20 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
    closeBtn: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    addHeaderBtn: {
        paddingHorizontal: 14, paddingVertical: 7,
        backgroundColor: '#F59E0B', borderRadius: 20,
    },
    addHeaderBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },

    /* Summary bar */
    summaryBar: {
        flexDirection: 'row', justifyContent: 'center',
        paddingHorizontal: 24, marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginHorizontal: 16, borderRadius: 14, paddingVertical: 12,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryNum: { fontSize: 22, fontWeight: '800', color: '#F59E0B' },
    summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 8 },

    /* List */
    list: { padding: 16, paddingTop: 12, gap: 12 },

    /* Card */
    card: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 18, overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
        minHeight: 90,
    },
    cardStripe: { width: 4, alignSelf: 'stretch' },
    cardIconBox: {
        width: 52, height: 52, borderRadius: 14, margin: 14,
        justifyContent: 'center', alignItems: 'center',
    },
    cardEmoji: { fontSize: 26 },
    cardBody: { flex: 1, paddingVertical: 14, paddingRight: 8 },
    cardLabel: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
    cardDate: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginBottom: 8 },
    cardDots: { flexDirection: 'row', gap: 4 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    cardRight: { alignItems: 'center', paddingRight: 16, paddingVertical: 14, minWidth: 70 },
    daysNumber: { fontSize: 30, fontWeight: '900', lineHeight: 32 },
    daysLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 2 },
    deleteBtn: {
        marginTop: 10, width: 26, height: 26, borderRadius: 13,
        backgroundColor: 'rgba(255,255,255,0.07)',
        justifyContent: 'center', alignItems: 'center',
    },
    deleteBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700' },

    /* Empty */
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 36 },
    emptyEmoji: { fontSize: 72, marginBottom: 20 },
    emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
    emptySub: {
        fontSize: 14, textAlign: 'center', lineHeight: 20,
        opacity: 0.55, marginBottom: 28,
    },
    emptyBtn: {
        backgroundColor: '#F59E0B', paddingVertical: 14,
        paddingHorizontal: 28, borderRadius: 50,
    },
    emptyBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },

    /* Sheet */
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    addSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
    sheetHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#555', alignSelf: 'center', marginBottom: 16,
    },
    sheetTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
    fieldLabel: {
        fontSize: 11, fontWeight: '700', letterSpacing: 1,
        textTransform: 'uppercase', opacity: 0.5, marginBottom: 8,
    },
    emojiChip: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(128,128,128,0.12)',
        justifyContent: 'center', alignItems: 'center', marginRight: 8,
    },
    colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
    colorChip: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    colorChipActive: { borderWidth: 3, borderColor: '#fff', elevation: 4 },
    colorCheck: { color: '#fff', fontSize: 16, fontWeight: '700' },
    input: {
        borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 15,
        marginBottom: 14, backgroundColor: 'rgba(128,128,128,0.07)',
    },
    dateBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderWidth: 1.5, borderRadius: 12, padding: 14,
        marginBottom: 16, backgroundColor: 'rgba(128,128,128,0.07)',
    },
    dateBtnText: { fontSize: 14, fontWeight: '500', flex: 1 },
    saveBtn: { paddingVertical: 15, borderRadius: 50, alignItems: 'center', marginTop: 4 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
