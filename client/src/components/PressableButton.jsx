import React, {useRef} from "react";
import {Pressable, Animated} from "react-native"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PressableButton({
    style,
    onPress,
    disabled,
    scaleTo = 0.8,
    children,
}) {
    const scaleValue = useRef(new Animated.Value(1)).current

    const handlePressIn = () => {
    Animated.spring(scaleValue, {
        toValue: scaleTo,
        useNativeDriver: true
    }).start()
    }

    const handlePressOut = () => {
    Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true
    }).start()
    }

    return (
        <AnimatedPressable
            style = {[style, { transform: [{ scale: scaleValue }] }]}
            onPressIn = {handlePressIn}
            onPressOut = {handlePressOut}
            onPress = {onPress}
            disabled = {disabled}
        >
            {children}
        </AnimatedPressable>
    )
}