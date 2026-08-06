import { Stack } from 'expo-router';

import { createHeaderOptions } from '@/navigation/config/screen-options';
import { useStackScreenOptions } from '@/navigation/hooks/use-screen-options';

export const unstable_settings = {
  anchor: 'index',
};

export default function DashboardLayout() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={createHeaderOptions({ title: 'Dashboard', largeTitle: true })}
      />
    </Stack>
  );
}
