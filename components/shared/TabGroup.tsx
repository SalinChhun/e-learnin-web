'use client'

import React from 'react'

interface Tab {
    id: string
    label: string
    badge?: number | string
}

interface TabGroupProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
}

export default function TabGroup({ tabs, activeTab, onTabChange }: TabGroupProps) {
    return (
        <div style={{ 
            marginBottom: '24px',
            display: 'inline-flex',
            backgroundColor: '#F3F4F6',
            borderRadius: '12px',
            padding: '4px',
            position: 'relative'
        }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        padding: '10px 24px',
                        backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                        color: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                        position: 'relative',
                        zIndex: activeTab === tab.id ? 1 : 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {tab.label}
                    {tab.badge !== undefined && tab.badge !== null && (
                        <span style={{
                            padding: '2px 8px',
                            backgroundColor: activeTab === tab.id ? '#F3F4F6' : 'rgba(0, 0, 0, 0.1)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#6B7280'
                        }}>
                            {tab.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}


