import * as Haptics from "expo-haptics"
import { useCallback } from "react"
import {useApp} from "@/contexts/AppContext"

const HAPTIC_STYLE = {
  Light: Haptics.ImpactFeedbackStyle.Light,
  Medium: Haptics.ImpactFeedbackStyle.Medium,
  Heavy: Haptics.ImpactFeedbackStyle.Heavy
}

export function useHaptics() {
    const {hapticLevel} = useApp()
    

    const fireHaptics = useCallback(() => {
        const style = HAPTIC_STYLE[hapticLevel];
        if (style) {
            Haptics.impactAsync(style)
        }
    }, [hapticLevel])

    const fireSelectionHaptics = useCallback(() => {
        if (hapticLevel === "Off") return
        Haptics.selectionAsync()
    }, [hapticLevel])

    const fireErrorHaptics = useCallback(() => {
        if (hapticLevel === "Off") return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
    })

    return {fireHaptics, fireSelectionHaptics, fireErrorHaptics}
}