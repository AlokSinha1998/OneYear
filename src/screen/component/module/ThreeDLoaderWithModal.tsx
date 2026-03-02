import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    Text,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';

const SIZE = 60;

const ThreeDLoaderWithModal = () => {
    const rotate = useSharedValue(0);
    const [visible, setVisible] = useState(false);

    const startAnimation = () => {
        rotate.value = withRepeat(
            withTiming(360, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    };

    const stopAnimation = () => {
        cancelAnimation(rotate); // 🔥 freezes at current value
    };

    useEffect(() => {
        startAnimation();
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 600 },
            { rotateX: `${rotate.value}deg` },
            { rotateY: `${rotate.value}deg` },
        ],
    }));

    const onPressLoader = () => {
        stopAnimation();
        setVisible(true);
    };

    const closeModal = () => {
        setVisible(false);
        startAnimation(); // optional: resume animation
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={onPressLoader}>
                <Animated.View style={[styles.cube, animatedStyle]} />
            </Pressable>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalBox}>
                        <Text style={styles.title}>Action Required</Text>
                        <Text style={styles.subtitle}>
                            Loader paused. User interaction detected.
                        </Text>

                        <Pressable onPress={closeModal} style={styles.button}>
                            <Text style={styles.buttonText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
export default React.memo(ThreeDLoaderWithModal)
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cube: {
        width: SIZE,
        height: SIZE,
        backgroundColor: '#4f46e5',
        borderRadius: 12,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 16,
    },
    button: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#4f46e5',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
    },
});
