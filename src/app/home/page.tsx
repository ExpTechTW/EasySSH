'use client';

import React, { useState, useCallback } from 'react';
import Terminal from '@/components/Terminal';
import TabBar from '@/components/TabBar';

interface Session {
  id: string;
  title: string;
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', title: 'Session 1' }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');

  // 新增 Session
  const handleNewTab = useCallback(() => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: `Session ${sessions.length + 1}`
    };
    setSessions([...sessions, newSession]);
    setActiveSessionId(newId);
  }, [sessions]);

  // 切換 Session
  const handleTabClick = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  // 關閉 Session
  const handleTabClose = useCallback((id: string) => {
    if (sessions.length === 1) {
      return; // 至少保留一個 session
    }

    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);

    // 如果關閉的是當前 session，切換到第一個
    if (activeSessionId === id) {
      setActiveSessionId(newSessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // 準備 tabs 資料
  const tabs = sessions.map(session => ({
    id: session.id,
    title: session.title,
    isActive: session.id === activeSessionId
  }));

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />

      {/* Terminal 區域 */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        {sessions.map(session => (
          <div
            key={session.id}
            className={`h-full p-3 ${session.id === activeSessionId ? 'block' : 'hidden'}`}
          >
            <Terminal sessionId={session.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
