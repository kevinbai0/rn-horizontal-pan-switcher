import React, { useRef } from "react";
import { TouchableWithoutFeedback, Animated, LayoutChangeEvent } from "react-native";

export interface IHorizontalPanItemProps {
    onPress?(index: number): void
    panValue: Animated.Value
    index: number
    total: number
    children?: any
    style?: object
    setItemWidth(width: number): void
}

const HorizontalPanItem: React.FC<IHorizontalPanItemProps> = ({panValue, index, total, onPress, children, style, setItemWidth}: IHorizontalPanItemProps) => {
    function handleLayout({nativeEvent: {layout}}: LayoutChangeEvent) {
        setItemWidth(layout.width);
    }
    
    return (
        <TouchableWithoutFeedback onPress={() => {
            onPress && onPress(index)
        }}>
            <Animated.View
                first={index === 0}
                last={index === total - 1}
                style={{
                    transform: [
                        { translateX: panValue }
                    ],
                    ...style
                }}
                onLayout={handleLayout}
            >
                { children }
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}

export default HorizontalPanItem;