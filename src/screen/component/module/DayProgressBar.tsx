import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");
const BAR_WIDTH = width * 0.9;

/* -------------------- LOGIC -------------------- */

const getDayProgress = (): number => {
    const now = new Date();
    const seconds =
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds();

    return seconds / 86400; // 0 → 1
};

const generateSafeColor = (): string => {
    const forbidden = ["#000000", "#ffffff"];

    let color = "#000000";

    while (forbidden.includes(color.toLowerCase())) {
        color =
            "#" +
            Math.floor(Math.random() * 0xffffff)
                .toString(16)
                .padStart(6, "0");
    }

    return color;
};

/* -------------------- COMPONENT -------------------- */

const DayProgressBar = () => {
    const progress = useSharedValue<number>(0);
    const shimmerPosition = useSharedValue<number>(-1);
    const pulseScale = useSharedValue<number>(1);

    const [completed, setCompleted] = useState<number>(0);
    const [remaining, setRemaining] = useState<number>(100);

    const [barColor] = useState<string>(generateSafeColor());

    const updateProgress = () => {
        const value = getDayProgress();
        const completedPct = +(value * 100).toFixed(2);

        setCompleted(completedPct);
        setRemaining(+(100 - completedPct).toFixed(2));

        progress.value = withTiming(value, {
            duration: 600,
        });
    };

    useEffect(() => {
        updateProgress();
        const interval = setInterval(updateProgress, 60_000);

        // Start shimmer animation - continuous sliding effect
        shimmerPosition.value = withRepeat(
            withTiming(1, {
                duration: 2000,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        // Subtle pulsing effect
        pulseScale.value = withRepeat(
            withTiming(1.02, {
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        return () => clearInterval(interval);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        width: BAR_WIDTH * progress.value,
        transform: [{ scaleY: pulseScale.value }],
    }));

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: shimmerPosition.value * BAR_WIDTH * 1.5,
            },
        ],
    }));

    return (
        <View style={styles.wrapper}>
            {/* TEXT */}
            <View style={styles.textRow}>
                <Text style={[styles.doneText]}>
                    {completed}% day completed
                </Text>
                <Text style={styles.leftText}>
                    {remaining}% left
                </Text>
            </View>

            {/* BAR */}
            <View style={styles.container}>
                <Animated.View style={[styles.fill, animatedStyle]}>
                    <LinearGradient
                        colors={[barColor, barColor]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    >
                        {/* Shimmer overlay */}
                        <Animated.View
                            style={[
                                styles.shimmerContainer,
                                shimmerStyle,
                            ]}
                        >
                            <LinearGradient
                                colors={[
                                    'transparent',
                                    'rgba(255, 255, 255, 0.3)',
                                    'rgba(255, 255, 255, 0.5)',
                                    'rgba(255, 255, 255, 0.3)',
                                    'transparent',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.shimmer}
                            />
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </View>
    );
};

export default DayProgressBar;

const styles = StyleSheet.create({
    wrapper: {
        width: BAR_WIDTH,
        marginVertical: 12,
    },
    textRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    doneText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "500",
    },
    leftText: {
        color: "#aaa",
        fontSize: 12,
    },
    container: {
        width: "100%",
        height: 6,
        backgroundColor: "#222",
        borderRadius: 3,
        overflow: "hidden",
    },
    fill: {
        height: "100%",
    },
    gradient: {
        flex: 1,
        width: "100%",
        height: "100%",
        overflow: "hidden",
    },
    shimmerContainer: {
        position: "absolute",
        top: 0,
        left: -BAR_WIDTH * 0.5,
        width: BAR_WIDTH * 0.5,
        height: "100%",
    },
    shimmer: {
        width: "100%",
        height: "100%",
    },
});