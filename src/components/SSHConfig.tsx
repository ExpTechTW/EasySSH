'use client';

import React, { useState } from 'react';
import type { SSHConfig } from '@/types/electron';

interface SSHConfigProps {
  onConnect: (config: SSHConfig) => void;
}

export default function SSHConfigComponent({ onConnect }: SSHConfigProps) {
  const [config, setConfig] = useState<SSHConfig>({
    host: '',
    port: 22,
    username: '',
    password: '',
  });

  const [usePrivateKey, setUsePrivateKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(config);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          SSH 連線設定
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              主機位址
            </label>
            <input
              type="text"
              required
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              連接埠
            </label>
            <input
              type="number"
              required
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="22"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              使用者名稱
            </label>
            <input
              type="text"
              required
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="username"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="usePrivateKey"
              checked={usePrivateKey}
              onChange={(e) => setUsePrivateKey(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="usePrivateKey" className="text-sm text-gray-300">
              使用私鑰認證
            </label>
          </div>

          {usePrivateKey ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                私鑰內容
              </label>
              <textarea
                required={usePrivateKey}
                value={config.privateKey || ''}
                onChange={(e) => setConfig({ ...config, privateKey: e.target.value, password: undefined })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                rows={6}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密碼
              </label>
              <input
                type="password"
                required={!usePrivateKey}
                value={config.password || ''}
                onChange={(e) => setConfig({ ...config, password: e.target.value, privateKey: undefined })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            連接
          </button>
        </form>
      </div>
    </div>
  );
}
