import * as Network from 'expo-network';

/** Best-effort online check using expo-network (already in the project). */
export async function isDeviceOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    if (state.isConnected !== true) return false;
    if (state.isInternetReachable === false) return false;
    return true;
  } catch {
    // Fail open for connectivity probes so offline-first flows stay usable.
    return true;
  }
}
