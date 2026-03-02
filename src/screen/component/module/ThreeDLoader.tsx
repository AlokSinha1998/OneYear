import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
} from 'react-native-reanimated';

const SIZE = 60;

const ThreeDLoader = () => {
    const rotate = useSharedValue(0);

    useEffect(() => {
        rotate.value = withRepeat(
            withTiming(360, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { perspective: 600 },        // 👈 THIS creates depth
                { rotateX: `${rotate.value}deg` },
                { rotateY: `${rotate.value}deg` },
            ],
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.cube, animatedStyle]} />
        </View>
    );
}
export default React.memo(ThreeDLoader)

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cube: {
        width: SIZE,
        height: SIZE,
        backgroundColor: '#4f46e5',
        borderRadius: 12,
    },
});
