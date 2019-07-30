
import React from "react";
import { View } from "react-native";
import HorizontalPanItem from "./HorizontalPanItem";
import { AutoAnimateOptions } from "./PanHandler";
import PanHooks from "./PanHooks";

export interface IHorizontalPanSwitcherProps {
  items: Array<JSX.Element>
  style?: object
  itemStyle?: object
  currentIndex?: number
  children?: any
  staggerFirst?: number
  autoTransitionOptions?: AutoAnimateOptions
  panHooks?: PanHooks
}

export interface IHorizontalPanSwitcherState {
  panHooks: PanHooks
  itemWidths: number[]
  fixedItemWidth?: number
  staggerFirst?: number
  shouldUpdate: boolean
}

export default class HorizontalPanSwitcher extends React.Component<IHorizontalPanSwitcherProps, IHorizontalPanSwitcherState> {
  itemWidths: number[] = []
  constructor(props: IHorizontalPanSwitcherProps) {
    super(props);

    this.itemWidths = props.items.map(_ => 0);

    props.panHooks && props.panHooks.update(this.itemWidths, props.staggerFirst);
    this.state = {
      panHooks: props.panHooks || new PanHooks(),
      itemWidths: props.items.map(_ => 0),
      staggerFirst: props.staggerFirst,
      shouldUpdate: false
    }
  }
  receivedItemWidth = (width: number, index: number) => {
    this.itemWidths[index] = width;
    if (this.itemWidths.filter(number => number).length === this.props.items.length && this.props.items.length > 0) {
      const updateWidths = this.itemWidths.map((width, index) => this.state.staggerFirst && index === 0 ? width + this.state.staggerFirst : width);
      this.state.panHooks.update(updateWidths);
      this.setState({
        itemWidths: updateWidths,
      })
    }
  }

  static getDerivedStateFromProps(props: IHorizontalPanSwitcherProps, state: IHorizontalPanSwitcherState) {
    if (HorizontalPanSwitcher.diffs(props,state)) {
      (props.panHooks || state.panHooks).reinit((props.panHooks || state.panHooks).panHandler.horizontalPanSwitcherShouldBeFirstResponder, (props.panHooks || state.panHooks).panSwitcher.itemPressed, (props.panHooks || state.panHooks).panSwitcher.indexChanged, state.itemWidths)
      return {
        panHooks: props.panHooks || state.panHooks,
        shouldUpdate: true
      }
    }
    return null;
  }

  static diffs = (props: IHorizontalPanSwitcherProps, state: IHorizontalPanSwitcherState) => {
    const panHooksDiff = props.panHooks ? props.panHooks !== state.panHooks : false;
    const itemWidthsDiff = state.itemWidths !== state.panHooks.itemWidths;
    const handleItemSelectedDiff = (props.panHooks || state.panHooks).panSwitcher.itemPressed !== state.panHooks.panSwitcher.itemPressed;
    const handleIndexChangedDiff = (props.panHooks || state.panHooks).panSwitcher.indexChanged !== state.panHooks.panSwitcher.indexChanged;
    const firstResponderDiff =(props.panHooks || state.panHooks).panHandler.horizontalPanSwitcherShouldBeFirstResponder !== state.panHooks.panHandler.horizontalPanSwitcherShouldBeFirstResponder;
    return panHooksDiff || itemWidthsDiff || handleItemSelectedDiff || handleIndexChangedDiff || firstResponderDiff;
  }

  componentDidUpdate() {
    if (this.state.shouldUpdate) this.setState({shouldUpdate: false});
  }

  shouldComponentUpdate(nextProps: Readonly<IHorizontalPanSwitcherProps>, nextState: Readonly<IHorizontalPanSwitcherState>, nextContext: any) {
    if (nextState.shouldUpdate !== this.state.shouldUpdate) return nextState.shouldUpdate;
    return true;
  }
  
  render() {
    return (
      <View {...this.state.panHooks.panResponder.panHandlers} style={{display: "flex", flexDirection: "row", ...this.props.style}}>
          <View style={{position: "absolute", width: "100%", height: "100%"}}>
            {this.props.children}
          </View>
          {
            this.props.items.map((item, index) =>
              <HorizontalPanItem
                key={index}
                panValue={this.state.panHooks.panHandler.panValue}
                index={index}
                total={this.props.items.length}
                onPress={() => this.state.panHooks.panSwitcher._handleItemPress(index) === false && this.state.panHooks.animateSwitch(index, this.props.autoTransitionOptions || {})}
                style={this.props.itemStyle}
                setItemWidth={(width: number) => this.receivedItemWidth(width, index) }
              >
                {item}
              </HorizontalPanItem>
            )
          }
      </View>
    )
  }
}
