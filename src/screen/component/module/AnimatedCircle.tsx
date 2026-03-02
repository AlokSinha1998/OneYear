import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withRepeat,
    Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 120;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CircularLoader = () => {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset:
            CIRCUMFERENCE * (1 - progress.value),
    }));

    return (
        <View>
            <Svg width={SIZE} height={SIZE}>
                {/* Background Circle */}
                <Circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    stroke="#e0e0e0"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                />

                {/* Animated Circle */}
                <AnimatedCircle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    stroke="#4f46e5"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
}


export default React.memo(CircularLoader)