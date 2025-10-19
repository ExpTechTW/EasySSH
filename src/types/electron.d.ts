export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

export interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export interface ElectronAPI {
  checkForUpdates: () => Promise<{ success: boolean; updateInfo?: UpdateInfo; error?: string }>;
  downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
  installUpdate: () => void;
  getAppVersion: () => Promise<string>;

  onUpdateChecking: (callback: () => void) => void;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateError: (callback: (error: string) => void) => void;
  onUpdateDownloadProgress: (callback: (progress: DownloadProgress) => void) => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;

  removeUpdateListeners: () => void;

  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  getAudioPath: (audioFile: string) => Promise<string>;

  setDockBadge: (text: string) => Promise<{ success: boolean; error?: string }>;
  clearDockBadge: () => Promise<{ success: boolean; error?: string }>;
  bounceDock: (type?: 'critical' | 'informational') => Promise<{ success: boolean; error?: string }>;

  quitApp: () => Promise<{ success: boolean; message?: string }>;
  showWindow: () => Promise<{ success: boolean; message?: string; error?: string }>;
  forceQuit: () => Promise<{ success: boolean; error?: string }>;

  // SSH and Terminal methods
  send: (channel: string, data: any) => void;
  on: (channel: string, callback: (event: any, data: any) => void) => void;
  removeListener: (channel: string, callback: (event: any, data: any) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electron?: ElectronAPI;
  }
}

export {};
