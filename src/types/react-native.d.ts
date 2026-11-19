declare module 'react-native' {
  import type * as React from 'react';

  export type DimensionValue = number | 'auto' | `${number}%`;

  export type AccessibilityRole =
    | 'none'
    | 'button'
    | 'link'
    | 'search'
    | 'image'
    | 'keyboardkey'
    | 'text'
    | 'adjustable'
    | 'imagebutton'
    | 'header'
    | 'summary'
    | 'alert'
    | 'checkbox'
    | 'combobox'
    | 'menu'
    | 'menubar'
    | 'menuitem'
    | 'progressbar'
    | 'radio'
    | 'radiogroup'
    | 'scrollbar'
    | 'spinbutton'
    | 'switch'
    | 'tab'
    | 'tablist'
    | 'timer'
    | 'toolbar';

  export interface AccessibilityProps {
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: {
      disabled?: boolean;
      selected?: boolean;
      checked?: boolean | 'mixed';
      busy?: boolean;
      expanded?: boolean;
    };
    accessibilityValue?: {
      min?: number;
      max?: number;
      now?: number;
      text?: string;
    };
  }

  export interface TransformStyle {
    perspective?: number;
    rotate?: string;
    rotateX?: string;
    rotateY?: string;
    rotateZ?: string;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    translateX?: number;
    translateY?: number;
    skewX?: string;
    skewY?: string;
  }

  export interface FlexStyle {
    alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    aspectRatio?: number | string;
    borderBottomWidth?: number;
    borderEndWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderStartWidth?: number;
    borderTopWidth?: number;
    borderWidth?: number;
    bottom?: DimensionValue;
    display?: 'none' | 'flex';
    end?: DimensionValue;
    flex?: number;
    flexBasis?: DimensionValue;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexGrow?: number;
    flexShrink?: number;
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    gap?: number;
    rowGap?: number;
    columnGap?: number;
    height?: DimensionValue;
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    left?: DimensionValue;
    margin?: DimensionValue;
    marginBottom?: DimensionValue;
    marginEnd?: DimensionValue;
    marginHorizontal?: DimensionValue;
    marginLeft?: DimensionValue;
    marginRight?: DimensionValue;
    marginStart?: DimensionValue;
    marginTop?: DimensionValue;
    marginVertical?: DimensionValue;
    maxHeight?: DimensionValue;
    maxWidth?: DimensionValue;
    minHeight?: DimensionValue;
    minWidth?: DimensionValue;
    overflow?: 'visible' | 'hidden' | 'scroll';
    padding?: DimensionValue;
    paddingBottom?: DimensionValue;
    paddingEnd?: DimensionValue;
    paddingHorizontal?: DimensionValue;
    paddingLeft?: DimensionValue;
    paddingRight?: DimensionValue;
    paddingStart?: DimensionValue;
    paddingTop?: DimensionValue;
    paddingVertical?: DimensionValue;
    position?: 'absolute' | 'relative' | 'fixed' | 'sticky';
    right?: DimensionValue;
    start?: DimensionValue;
    top?: DimensionValue;
    width?: DimensionValue;
    zIndex?: number;
  }

  export interface ViewStyle extends FlexStyle {
    backfaceVisibility?: 'visible' | 'hidden';
    backgroundColor?: string;
    borderBottomColor?: string;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    borderColor?: string;
    borderLeftColor?: string;
    borderRadius?: number;
    borderRightColor?: string;
    borderStyle?: 'solid' | 'dotted' | 'dashed';
    borderTopColor?: string;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    elevation?: number;
    opacity?: number;
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    transform?: TransformStyle[];
  }

  export interface TextStyle extends ViewStyle {
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: 'normal' | 'italic';
    fontVariant?: ('small-caps' | 'oldstyle-nums' | 'lining-nums' | 'tabular-nums' | 'proportional-nums')[];
    fontWeight?:
      | 'normal'
      | 'bold'
      | '100'
      | '200'
      | '300'
      | '400'
      | '500'
      | '600'
      | '700'
      | '800'
      | '900';
    letterSpacing?: number;
    lineHeight?: number;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
    textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  }

  export type StyleProp<T> = T | false | null | undefined | readonly StyleProp<T>[];

  export interface ViewProps extends AccessibilityProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    testID?: string;
  }

  export interface TextProps extends AccessibilityProps {
    children?: React.ReactNode;
    numberOfLines?: number;
    style?: StyleProp<TextStyle>;
    testID?: string;
  }

  export interface TextInputProps extends AccessibilityProps {
    value?: string;
    defaultValue?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    editable?: boolean;
    style?: StyleProp<TextStyle>;
    testID?: string;
  }

  export interface PressableStateCallbackType {
    pressed: boolean;
    hovered?: boolean;
    focused?: boolean;
  }

  export interface PressableProps extends AccessibilityProps {
    children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);
    onPress?: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
    testID?: string;
  }

  export interface ScrollViewProps extends ViewProps {
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
  }

  export interface ModalProps {
    visible?: boolean;
    transparent?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    onRequestClose?: () => void;
    children?: React.ReactNode;
  }

  export const View: React.ComponentType<ViewProps>;
  export const SafeAreaView: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const TextInput: React.ComponentType<TextInputProps>;
  export const Pressable: React.ComponentType<PressableProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const Modal: React.ComponentType<ModalProps>;

  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle>>(styles: T): T;
  };

  export const Platform: {
    OS: 'web' | 'ios' | 'android' | 'windows' | 'macos';
    select<T>(specifics: {
      web?: T;
      ios?: T;
      android?: T;
      native?: T;
      default?: T;
    }): T;
  };

  export const Linking: {
    openURL(url: string): Promise<void>;
    canOpenURL(url: string): Promise<boolean>;
  };

  export const AppRegistry: {
    registerComponent(appKey: string, componentProvider: () => React.ComponentType<Record<string, never>>): void;
    runApplication(appKey: string, appParameters: { rootTag: HTMLElement | null }): void;
  };

  export function useWindowDimensions(): {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };
}
