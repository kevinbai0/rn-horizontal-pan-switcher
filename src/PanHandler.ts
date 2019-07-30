import { Animated, PanResponderGestureState, Easing } from "react-native";

export interface AutoAnimateOptions {
    duration?: number,
    maxDuration?: number,
    minDuration?: number
}

export default class PanHandler {
    horizontalPanSwitcherShouldBeFirstResponder?: (disable: boolean) => void;
    panValue: Animated.Value;
    constructor(horizontalPanSwitcherShouldBeFirstResponder?: (disable: boolean) => void) {
        this.horizontalPanSwitcherShouldBeFirstResponder = horizontalPanSwitcherShouldBeFirstResponder;
        this.panValue = new Animated.Value(0);
    }
    totalPanWidth = (target: number, itemWidths: number[], staggerFirst?: number) => {
        return itemWidths.reduce((accum, current, index) => index < target ? accum + current : accum, 0);
    }

    handlePan = (gesture: PanResponderGestureState, currentIndex: number, itemWidths: number[], staggerFirst?: number) => {
        let canSwipe = true;
        const slope = gesture.dy / gesture.dx;
        if (Math.abs(slope) > 3 || isNaN(slope) || !isFinite(slope)) {
            this.horizontalPanSwitcherShouldBeFirstResponder && this.horizontalPanSwitcherShouldBeFirstResponder(false);
        }
        else {
            this.horizontalPanSwitcherShouldBeFirstResponder && this.horizontalPanSwitcherShouldBeFirstResponder(true);
            const direction: "next" | "back" = gesture.dx > 0 ? "back" : "next";
            if (currentIndex === 0 && direction === "back") canSwipe = false;
            if (currentIndex === itemWidths.length - 1 && direction === "next") canSwipe = false;

            this.panValue.setValue(-this.totalPanWidth(currentIndex, itemWidths, staggerFirst) + gesture.dx * (canSwipe ? 1 : 0.4));
        }
    }

    handleEndPan = (gesture: PanResponderGestureState, currentIndex: number, itemWidths: number[], changeIndex: (index: number, options?: AutoAnimateOptions) => void, staggerFirst?: number) => {
        const direction: "next" | "back" = gesture.dx > 0 ? "back" : "next";
        const currentWidth = itemWidths[currentIndex];
        let goodSwipe = Math.abs(gesture.dx) > currentWidth / 2 || Math.abs(gesture.vx) > 0.5;
        if ((gesture.dx > 0 && gesture.vx < 0) || (gesture.dx < 0 && gesture.vx > 0)) goodSwipe = false;
        let canSwipe = true;
        if (currentIndex === 0 && direction === "back") canSwipe = false;
        if (currentIndex === itemWidths.length - 1 && direction === "next") canSwipe = false;
        if (goodSwipe && canSwipe) {
            let duration = (1.5 - Math.abs(gesture.vx)) * 200;
            if (duration < 150) duration = 150;
            if (duration > 300) duration = 300;
            changeIndex(gesture.dx < 0 ? currentIndex + 1 : currentIndex - 1, {duration});
        }
        else {
            Animated.timing(this.panValue, {
                toValue: -this.totalPanWidth(currentIndex, itemWidths, staggerFirst),
                duration: 300,
                easing: Easing.in(Easing.elastic(0.5)),
            }).start();
        }
        this.horizontalPanSwitcherShouldBeFirstResponder && this.horizontalPanSwitcherShouldBeFirstResponder(false)
    }

    animateSwitchIndex = (targetIndex: number, itemWidths: number[], options: AutoAnimateOptions, staggerFirst?: number) => {
        const target = this.totalPanWidth(targetIndex, itemWidths, staggerFirst);
        let desiredDuration = Math.abs(-this.panValue._value - target) * 0.7 //: Math.abs(width - totalPanWidth(currentIndex));
        if (options) {
            if (options.maxDuration && desiredDuration > options.maxDuration) desiredDuration = options.maxDuration;
            if (options.minDuration && desiredDuration < options.minDuration) desiredDuration = options.minDuration;
        }
        const duration = options && options.duration ? options.duration : desiredDuration;
        Animated.timing(this.panValue, {
            toValue: -target,
            duration: options && options.duration || duration,
            easing: Easing.out(Easing.ease),
        }).start(() => this.panValue.setValue(-target));
    }
}