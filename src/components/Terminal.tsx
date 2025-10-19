'use client';

import React, { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  sessionId?: string;
}

export default function Terminal({ sessionId = 'default' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // 動態載入 xterm.js 模組（只在客戶端）
    const loadXterm = async () => {
      const { Terminal: XTerm } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      const { WebLinksAddon } = await import('@xterm/addon-web-links');

      // 創建 xterm 實例，使用深色主題配置
      const term = new XTerm({
        cursorBlink: true,
        cursorStyle: 'block',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        fontWeight: '400',
        fontWeightBold: '700',
        lineHeight: 1.3,
        letterSpacing: 0.5,
        theme: {
          background: '#0d1117',
          foreground: '#e6edf3',
          cursor: '#60a5fa',
          cursorAccent: '#0d1117',
          selectionBackground: 'rgba(59, 130, 246, 0.3)',
          selectionForeground: '#e6edf3',
          black: '#0d1117',
          red: '#ff7b72',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          magenta: '#bc8cff',
          cyan: '#39c5cf',
          white: '#b1bac4',
          brightBlack: '#6e7681',
          brightRed: '#ffa198',
          brightGreen: '#56d364',
          brightYellow: '#e3b341',
          brightBlue: '#79c0ff',
          brightMagenta: '#d2a8ff',
          brightCyan: '#56d4dd',
          brightWhite: '#f0f6fc',
        },
        allowProposedApi: true,
        scrollback: 10000,
        tabStopWidth: 4,
        smoothScrollDuration: 100,
      });

      // 添加插件
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);

      // 掛載到 DOM
      if (terminalRef.current) {
        term.open(terminalRef.current);
        fitAddon.fit();
      }

      // 保存引用
      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // 監聽用戶輸入
      term.onData((data) => {
        // 發送數據到 Electron 主進程
        if (window.electron) {
          window.electron.send('terminal-input', { sessionId, data });
        }
      });

      // 監聽來自 Electron 的輸出
      if (window.electron) {
        const handleOutput = (_event: any, data: { sessionId: string; data: string }) => {
          if (data.sessionId === sessionId && xtermRef.current) {
            xtermRef.current.write(data.data);
          }
        };

        const handleExit = (_event: any, data: { sessionId: string; exitCode: number }) => {
          if (data.sessionId === sessionId && xtermRef.current) {
            xtermRef.current.writeln(`\r\nProcess exited with code ${data.exitCode}`);
          }
        };

        window.electron.on('terminal-output', handleOutput);
        window.electron.on('terminal-exit', handleExit);

        // 創建終端 session
        window.electron.send('terminal-create', { sessionId });

        // 清理函數
        return () => {
          window.electron.removeListener('terminal-output', handleOutput);
          window.electron.removeListener('terminal-exit', handleExit);
          window.electron.send('terminal-destroy', { sessionId });
        };
      } else {
        // 如果不在 Electron 環境，顯示提示
        term.writeln('EasySSH Terminal');
        term.writeln('This terminal requires the Electron environment to function.\r\n');
      }

      // 處理窗口大小變化
      const handleResize = () => {
        if (fitAddonRef.current && xtermRef.current) {
          fitAddonRef.current.fit();
          const { cols, rows } = xtermRef.current;

          // 通知後端調整 PTY 大小
          if (window.electron) {
            window.electron.send('terminal-resize', {
              sessionId,
              cols,
              rows,
            });
          }
        }
      };

      window.addEventListener('resize', handleResize);
    };

    loadXterm();

    // 清理函數
    return () => {
      window.removeEventListener('resize', () => {});
      if (window.electron) {
        window.electron.send('terminal-destroy', { sessionId });
      }
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [sessionId]);

  return (
    <div className="terminal-container w-full h-full">
      <div ref={terminalRef} className="terminal w-full h-full" />
    </div>
  );
}
