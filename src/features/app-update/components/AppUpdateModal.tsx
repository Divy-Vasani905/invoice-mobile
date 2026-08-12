import { memo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Modal } from '@/components/feedback/Modal';
import { cStyle } from '@/theme';

export type AppUpdateModalProps = {
  visible: boolean;
  isForced: boolean;
  onLater: () => void;
  onUpdate: () => void;
  onRequestClose: () => void;
};

/**
 * Update Available / Update Required dialog.
 * Forced updates hide Later and disable backdrop dismiss.
 */
export const AppUpdateModal = memo(function AppUpdateModal({
  visible,
  isForced,
  onLater,
  onUpdate,
  onRequestClose,
}: AppUpdateModalProps) {
  return (
    <Modal
      visible={visible}
      title={isForced ? 'Update Required' : 'Update Available'}
      description={
        isForced
          ? 'A new version of Easy Invoice Maker is required to continue. Please update the app.'
          : 'A new version of Easy Invoice Maker is available. Update now to get the latest improvements and fixes.'
      }
      size="md"
      closable={!isForced}
      onRequestClose={onRequestClose}
      footer={
        <View
          style={[
            cStyle.flexRow,
            cStyle.g8,
            cStyle.mv12,
            { justifyContent: 'space-around', flexWrap: 'wrap' },
          ]}
        >
          {!isForced && (
            <Button label="Later" variant="secondary" onPress={onLater} style={{ minWidth: 140 }} />
          )}
          <Button label="Update App" onPress={onUpdate} style={{ minWidth: 140 }} />
        </View>
      }
    />
  );
});
