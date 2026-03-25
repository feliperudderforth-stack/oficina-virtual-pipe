'use client';

import React, { useState } from 'react';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { cn } from '@/lib/utils';
import {
  Volume2, VolumeX, Monitor, Moon, Sun, Bell, BellOff,
  User, Palette, Keyboard, Info, Shield, LogOut,
  ChevronRight
} from 'lucide-react';

function SettingToggle({ label, description, enabled, onChange }: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors duration-200',
          enabled ? 'bg-brand-600' : 'bg-gray-300'
        )}
        onClick={() => onChange(!enabled)}
      >
        <div
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

export default function SettingsPanel() {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [proximityAudio, setProximityAudio] = useState(true);
  const [autoAway, setAutoAway] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900">Settings</h2>
        <p className="text-xs text-gray-500">Customize your office experience</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <SettingSection title="Audio & Video">
          <SettingToggle
            label="Proximity Audio"
            description="Hear people near you in the office"
            enabled={proximityAudio}
            onChange={setProximityAudio}
          />
          <SettingToggle
            label="Sound Effects"
            description="Play sounds for notifications and events"
            enabled={sounds}
            onChange={setSounds}
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <SettingToggle
            label="Desktop Notifications"
            description="Show notifications for messages and calls"
            enabled={notifications}
            onChange={setNotifications}
          />
        </SettingSection>

        <SettingSection title="Presence">
          <SettingToggle
            label="Auto Away"
            description="Automatically set status to Away after 5 minutes of inactivity"
            enabled={autoAway}
            onChange={setAutoAway}
          />
        </SettingSection>

        <SettingSection title="Appearance">
          <SettingToggle
            label="Compact Mode"
            description="Reduce padding and font sizes"
            enabled={compactMode}
            onChange={setCompactMode}
          />
        </SettingSection>

        <SettingSection title="Shortcuts">
          <div className="py-2 space-y-2">
            {[
              { keys: 'W A S D', desc: 'Move character' },
              { keys: 'C', desc: 'Open chat' },
              { keys: 'P', desc: 'Open people' },
              { keys: 'R', desc: 'Open rooms' },
              { keys: 'M', desc: 'Toggle minimap' },
              { keys: 'Esc', desc: 'Close panels' },
            ].map(({ keys, desc }) => (
              <div key={keys} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{desc}</span>
                <div className="flex gap-1">
                  {keys.split(' ').map(key => (
                    <kbd
                      key={key}
                      className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono text-gray-600"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SettingSection>

        <SettingSection title="About">
          <div className="py-3">
            <p className="text-sm text-gray-700 font-semibold">Virtual Office Platform</p>
            <p className="text-xs text-gray-500 mt-1">v1.0.0 · Enterprise Edition</p>
            <p className="text-xs text-gray-400 mt-0.5">Supports up to 2,000+ concurrent users</p>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}
