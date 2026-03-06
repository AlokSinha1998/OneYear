import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

type Slide = {
    icon: string;
    title: string;
    description: string;
    accent: string;
};

const SLIDES: Slide[] = [
    {
        icon: '📅',
        title: 'Welcome to OneYear',
        description: 'See all 365 days of your year laid out as glowing dots — your whole year at a glance.',
        accent: '#F59E0B',
    },
    {
        icon: '📍',
        title: 'Today, Always Visible',
        description: "Today's dot pulses with a glow so you always know exactly where you stand in the year.",
        accent: '#10B981',
    },
    {
        icon: '🔮',
        title: 'Past & Future',
        description: 'Bright dots are days that have passed. Dimmer dots are the days still ahead of you.',
        accent: '#8B5CF6',
    },
    {
        icon: '🎯',
        title: 'Set Goals on Any Day',
        description: 'Long-press any dot to pin a goal, milestone, or reminder directly on that day.',
        accent: '#EF4444',
    },
    {
        icon: '⏳',
        title: 'Track Countdowns',
        description: 'Tap the menu ☰ → Countdowns to add events and watch the days tick down.',
        accent: '#3B82F6',
    },
];

type OnboardingModalProps = {
    visible: boolean;
    onDone: () => void;
};

const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onDone }) => {
    const { theme } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const isLast = currentIndex === SLIDES.length - 1;
    const slide = SLIDES[currentIndex];

    const animateToSlide = (nextIndex: number) => {
        // Slide + fade out
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            setCurrentIndex(nextIndex);
            slideAnim.setValue(30);
            // Slide + fade in from right
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        });
    };

    const handleNext = () => {
        if (isLast) {
            onDone();
            // Reset for safety (in case it's shown again somehow)
            setCurrentIndex(0);
        } else {
            animateToSlide(currentIndex + 1);
        }
    };

    const handleSkip = () => {
        onDone();
        setCurrentIndex(0);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: theme.menuBg }]}>

                    {/* Skip button */}
                    <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
                        <Text style={[styles.skipText, { color: theme.menuText }]}>Skip</Text>
                    </TouchableOpacity>

                    {/* Slide content */}
                    <Animated.View
                        style={[
                            styles.slideContent,
                            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
                        ]}
                    >
                        {/* Icon bubble */}
                        <View style={[styles.iconBubble, { backgroundColor: slide.accent + '22' }]}>
                            <Text style={styles.icon}>{slide.icon}</Text>
                        </View>

                        <Text style={[styles.title, { color: theme.menuText }]}>{slide.title}</Text>
                        <Text style={[styles.description, { color: theme.menuText }]}>{slide.description}</Text>
                    </Animated.View>

                    {/* Dot indicators */}
                    <View style={styles.dots}>
                        {SLIDES.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            i === currentIndex ? slide.accent : theme.menuText + '33',
                                        width: i === currentIndex ? 20 : 8,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Next / Get Started button */}
                    <TouchableOpacity
                        style={[styles.nextBtn, { backgroundColor: slide.accent }]}
                        onPress={handleNext}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.nextBtnText}>
                            {isLast ? 'Get Started 🚀' : 'Next  →'}
                        </Text>
                    </TouchableOpacity>

                    {/* Step counter */}
                    <Text style={[styles.stepCounter, { color: theme.menuText }]}>
                        {currentIndex + 1} / {SLIDES.length}
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

export default OnboardingModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 28,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 16,
    },
    skipBtn: {
        alignSelf: 'flex-end',
        paddingHorizontal: 4,
        paddingVertical: 2,
        marginBottom: 8,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.55,
    },
    slideContent: {
        alignItems: 'center',
        width: '100%',
        minHeight: 200,
        justifyContent: 'center',
    },
    iconBubble: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    icon: {
        fontSize: 46,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.2,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.7,
        paddingHorizontal: 8,
    },
    dots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 28,
        marginBottom: 20,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    nextBtn: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 50,
        alignItems: 'center',
        marginBottom: 12,
    },
    nextBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    stepCounter: {
        fontSize: 12,
        opacity: 0.4,
        fontWeight: '500',
    },
});
