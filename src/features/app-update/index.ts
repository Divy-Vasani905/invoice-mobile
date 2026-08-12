export { AppConfigGates } from './components/AppConfigGates';
export { AppUpdateModal } from './components/AppUpdateModal';
export { useAppUpdatePrompt } from './hooks/useAppUpdatePrompt';
export {
  checkForAppUpdate,
  compareVersions,
  dismissOptionalUpdatePrompt,
  getCurrentAppVersion,
  getLatestStoreVersion,
  isUpdateAvailable,
  openStoreListing,
  shouldSuppressOptionalUpdatePrompt,
} from './services/AppUpdateService';
