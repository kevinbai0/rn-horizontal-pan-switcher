import { PanResponder, PanResponderInstance } from "react-native";
import PanHandler, { AutoAnimateOptions } from "./PanHandler";
import PanSwitcher from "./PanSwitcher";

export default class PanHooks {
  panHandler: PanHandler;
  panSwitcher: PanSwitcher;
  itemWidths: number[] = [];
  panResponder: PanResponderInstance;
  staggerFirst?: number

  constructor(horizontalPanSwitcherShouldBeFirstResponder?: (disable: boolean) => void, itemPressed?: (index: number) => void, itemChanged?: (prevIndex: number, newIndex: number) => void) {
    this.panHandler = new PanHandler(horizontalPanSwitcherShouldBeFirstResponder);
    this.panSwitcher = new PanSwitcher(itemPressed, itemChanged);
    this.panResponder = this._createPanResponder();
  }

  updateItemWidths(widths: number[]) {
    this.itemWidths = widths;
  }

  update(widths: number[], staggerFirst?: number) {
    this.itemWidths = widths;
    if (staggerFirst) this.staggerFirst = staggerFirst;
  }
  reinit(horizontalPanSwitcherShouldBeFirstResponder?: (disable: boolean) => void, itemPressed?: (index: number) => void, itemChanged?: (prevIndex: number, newIndex: number) => void, itemWidths?: number[]) {
    if (itemWidths) this.itemWidths = itemWidths;
    if (horizontalPanSwitcherShouldBeFirstResponder) this.panHandler.horizontalPanSwitcherShouldBeFirstResponder = horizontalPanSwitcherShouldBeFirstResponder;
    if (itemPressed) this.panSwitcher.itemPressed = itemPressed;
    if (itemChanged) this.panSwitcher.indexChanged = itemChanged;
    this.panResponder = this._createPanResponder();
  }

  animateSwitch(index: number, options?: AutoAnimateOptions) {
    this.panHandler.animateSwitchIndex(index, this.itemWidths, options || {}, this.staggerFirst);
    this.panSwitcher._changeIndex(index);
  }

  _createPanResponder = () => {
    return PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => false,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy / gestureState.dx) < 3,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => Math.abs(gestureState.dy / gestureState.dx) < 3,
    
      onPanResponderMove: (evt, gestureState) => {
        this.panHandler.handlePan(gestureState, this.panSwitcher.currentIndex, this.itemWidths, this.staggerFirst);
      },
      onPanResponderEnd: (evt, gestureState) => {
        this.panHandler.handleEndPan(gestureState, this.panSwitcher.currentIndex || 0, this.itemWidths, (index: number, options?: AutoAnimateOptions) => {
          this.panHandler.animateSwitchIndex(index, this.itemWidths, {});
          this.panSwitcher._changeIndex(index, options);
        }, this.staggerFirst);
      },
      onPanResponderTerminate: (evt, gestureState) => {
        this.panHandler.handleEndPan(gestureState, this.panSwitcher && this.panSwitcher.currentIndex || 0, this.itemWidths, (index: number, options?: AutoAnimateOptions) => {
          this.panHandler.animateSwitchIndex(index, this.itemWidths,{});
          this.panSwitcher._changeIndex(index, options);
        }, this.staggerFirst);
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onShouldBlockNativeResponder: (e, gestureState) => true
    });
  }
}