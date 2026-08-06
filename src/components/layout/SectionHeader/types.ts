import type { StyleProp, ViewStyle } from 'react-native';

export interface SectionHeaderProps {
  /** The title text for the section */
  title: string;
  /** Optional label for an action on the right side (e.g., "See All") */
  actionLabel?: string;
  /** Callback when the right action is pressed */
  onActionPress?: () => void;
  /** Custom style for the header container */
  style?: StyleProp<ViewStyle>;
  /** Custom accessibility label for the action button */
  accessibilityLabel?: string;
}
