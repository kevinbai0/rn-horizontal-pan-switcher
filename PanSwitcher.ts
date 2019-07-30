import { Animated, PanResponderGestureState, Easing } from "react-native";
import { useState, useEffect, useReducer, Dispatch } from "react";
import { AutoAnimateOptions } from "./PanHandler";

export default class PanSwitcher {
    itemPressed?: (index: number) => void;
    indexChanged?: (prevIndex: number, newIndex: number) => void;
    currentIndex: number;
    constructor(itemPressed?: (index: number) => void, indexChanged?: (prevIndex: number, newIndex: number) => void) {
        this.itemPressed = itemPressed;
        this.indexChanged = indexChanged;
        this.currentIndex = 0;
    }

    _changeIndex(index: number, options?: AutoAnimateOptions) {
        const oldIndex = this.currentIndex;
        this.currentIndex = index;
        this.indexChanged && this.indexChanged(oldIndex, index);
    }

    _handleItemPress(index: number): boolean {
        if (index !== this.currentIndex) {
            this._changeIndex(index, {duration: 150});
            return false;
        }
        else {
            this.itemPressed && this.itemPressed(index);
            return true;
        }
    }
}