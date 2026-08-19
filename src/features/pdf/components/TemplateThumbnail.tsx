import { memo } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import { cStyleValues } from '@/theme/cStyle';

import { INVOICE_PDF_PAPER_BACKGROUND } from '../templates/shared/htmlDocument';

import type { InvoicePdfTemplateId } from '../types/pdf.types';

type TemplateThumbnailProps = {
  templateId: InvoicePdfTemplateId;
  accentColor: string;
};

/**
 * Compact schematic of each PDF layout. Full invoice HTML lives on the preview screen.
 */
export const TemplateThumbnail = memo(function TemplateThumbnail({
  templateId,
  accentColor,
}: TemplateThumbnailProps) {
  const { theme } = useTheme();
  const line = theme.colors.border;
  const muted = theme.colors.borderStrong;
  const paper = theme.colors.surface;
  const onAccent = INVOICE_PDF_PAPER_BACKGROUND;

  return (
    <View
      accessible={false}
      style={{
        height: 88,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.cards.layout.radius,
        padding: cStyleValues.spacing.sm,
        backgroundColor: paper,
        gap: 6,
      }}
    >
      {templateId === 'classic' ? (
        <ClassicSketch accentColor={accentColor} line={line} muted={muted} />
      ) : templateId === 'modern' ? (
        <ModernSketch accentColor={accentColor} line={line} muted={muted} onAccent={onAccent} />
      ) : (
        <MinimalSketch accentColor={accentColor} line={line} muted={muted} />
      )}
    </View>
  );
});

function ClassicSketch({
  accentColor,
  line,
  muted,
}: {
  accentColor: string;
  line: string;
  muted: string;
}) {
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1, gap: 3 }}>
          <View
            style={{ height: 5, width: '70%', backgroundColor: accentColor, borderRadius: 1 }}
          />
          <View style={{ height: 3, width: '90%', backgroundColor: muted, borderRadius: 1 }} />
          <View style={{ height: 3, width: '55%', backgroundColor: line, borderRadius: 1 }} />
        </View>
        <View style={{ width: 48, alignItems: 'flex-end', gap: 3 }}>
          <View style={{ height: 6, width: 36, backgroundColor: accentColor, borderRadius: 1 }} />
          <View style={{ height: 3, width: 28, backgroundColor: muted, borderRadius: 1 }} />
        </View>
      </View>
      <View style={{ height: 2, backgroundColor: accentColor }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ height: 3, width: '40%', backgroundColor: muted, borderRadius: 1 }} />
          <View style={{ height: 3, width: '80%', backgroundColor: line, borderRadius: 1 }} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ height: 3, width: '50%', backgroundColor: muted, borderRadius: 1 }} />
          <View
            style={{ height: 5, width: '45%', backgroundColor: accentColor, borderRadius: 1 }}
          />
        </View>
      </View>
      <View style={{ height: 8, backgroundColor: accentColor, borderRadius: 1 }} />
      <View style={{ height: 3, backgroundColor: line, borderRadius: 1 }} />
      <View style={{ height: 3, width: '85%', backgroundColor: line, borderRadius: 1 }} />
      <View
        style={{
          alignSelf: 'flex-end',
          width: '38%',
          height: 6,
          backgroundColor: accentColor,
          borderRadius: 1,
        }}
      />
    </>
  );
}

function ModernSketch({
  accentColor,
  line,
  muted,
  onAccent,
}: {
  accentColor: string;
  line: string;
  muted: string;
  onAccent: string;
}) {
  return (
    <>
      <View
        style={{
          height: 22,
          borderRadius: 6,
          backgroundColor: accentColor,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 6,
        }}
      >
        <View
          style={{
            height: 5,
            width: '36%',
            backgroundColor: onAccent,
            borderRadius: 1,
            opacity: 0.9,
          }}
        />
        <View
          style={{
            height: 7,
            width: 28,
            backgroundColor: onAccent,
            borderRadius: 1,
            opacity: 0.95,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View
          style={{
            flex: 1,
            height: 18,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: accentColor,
            opacity: 0.45,
            padding: 4,
            gap: 2,
          }}
        >
          <View style={{ height: 3, width: '50%', backgroundColor: muted, borderRadius: 1 }} />
          <View style={{ height: 3, width: '75%', backgroundColor: line, borderRadius: 1 }} />
        </View>
        <View
          style={{
            flex: 1,
            height: 18,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: line,
            padding: 4,
            gap: 2,
          }}
        >
          <View style={{ height: 3, width: '40%', backgroundColor: muted, borderRadius: 1 }} />
          <View
            style={{ height: 5, width: '55%', backgroundColor: accentColor, borderRadius: 1 }}
          />
        </View>
      </View>
      <View style={{ height: 8, backgroundColor: accentColor, borderRadius: 2 }} />
      <View
        style={{
          alignSelf: 'flex-end',
          width: '42%',
          height: 14,
          borderRadius: 4,
          backgroundColor: accentColor,
          opacity: 0.18,
        }}
      />
    </>
  );
}

function MinimalSketch({
  accentColor,
  line,
  muted,
}: {
  accentColor: string;
  line: string;
  muted: string;
}) {
  return (
    <>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <View style={{ height: 5, width: '48%', backgroundColor: accentColor, borderRadius: 1 }} />
        <View style={{ height: 4, width: 40, backgroundColor: muted, borderRadius: 1 }} />
      </View>
      <View style={{ height: 3, width: '70%', backgroundColor: line, borderRadius: 1 }} />
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 2 }}>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ height: 3, width: '30%', backgroundColor: muted, borderRadius: 1 }} />
          <View style={{ height: 3, width: '80%', backgroundColor: line, borderRadius: 1 }} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ height: 3, width: '35%', backgroundColor: muted, borderRadius: 1 }} />
          <View style={{ height: 3, width: '75%', backgroundColor: line, borderRadius: 1 }} />
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: muted, marginVertical: 2 }} />
      <View style={{ height: 3, backgroundColor: line, borderRadius: 1 }} />
      <View style={{ height: 3, width: '92%', backgroundColor: line, borderRadius: 1 }} />
      <View style={{ height: 3, width: '78%', backgroundColor: line, borderRadius: 1 }} />
      <View
        style={{
          alignSelf: 'flex-end',
          width: '28%',
          height: 5,
          backgroundColor: accentColor,
          borderRadius: 1,
        }}
      />
    </>
  );
}
