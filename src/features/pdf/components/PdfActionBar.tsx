import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { cStyle } from '@/theme';

export interface PdfActionBarProps {
  isGenerating?: boolean;
  isSharing?: boolean;
  isPrinting?: boolean;
  disabled?: boolean;
  onGenerate?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  showGenerate?: boolean;
}

export const PdfActionBar = memo(function PdfActionBar({
  isGenerating = false,
  isSharing = false,
  isPrinting = false,
  disabled = false,
  onGenerate,
  onShare,
  onPrint,
  showGenerate = true,
}: PdfActionBarProps) {
  const busy = disabled || isGenerating || isSharing || isPrinting;

  return (
    <View style={[cStyle.g12]}>
      {/* {showGenerate && onGenerate != null ? (
        <Button
          label={isGenerating ? 'Preparing invoice…' : 'Generate PDF'}
          loading={isGenerating}
          disabled={busy && !isGenerating}
          onPress={onGenerate}
          leftIcon={({ color, size }) => (
            <Ionicons name="document-outline" color={color} size={size} />
          )}
          accessibilityLabel="Generate PDF"
          accessibilityHint="Creates a PDF of this invoice"
        />
      ) : null} */}
      {onShare != null && (
        <Button
          label={isSharing || isGenerating ? 'Preparing invoice…' : 'Share PDF'}
          loading={isSharing || (isGenerating && !isPrinting)}
          disabled={busy && !isSharing}
          onPress={onShare}
          leftIcon={({ color, size }) => (
            <Ionicons name="share-outline" color={color} size={size} />
          )}
          accessibilityLabel="Share PDF"
          accessibilityHint="Opens the system share sheet for this invoice PDF"
        />
      )}
      {onPrint != null && (
        <Button
          label={isPrinting || isGenerating ? 'Preparing invoice…' : 'Print PDF'}
          variant="secondary"
          loading={isPrinting}
          disabled={busy && !isPrinting}
          onPress={onPrint}
          leftIcon={({ color, size }) => (
            <Ionicons name="print-outline" color={color} size={size} />
          )}
          accessibilityLabel="Print PDF"
          accessibilityHint="Opens the system print dialog for this invoice PDF"
        />
      )}
    </View>
  );
});
