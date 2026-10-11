import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, User, ChevronDown, Check, Building2, MapPin, LogOut } from 'lucide-react';

export const Header = ({
    activeTab,
    setActiveTab,
    villages = [],
    selectedVillage,
    setSelectedVillage
}) => {
    const { user, logout, isSuperAdmin, isVillageAdmin } = useAuth();
    const [villageDropdownOpen, setVillageDropdownOpen] = useState(false);

    return (
        <header className="header-container">
            <div className="header-top">
                {/* Brand / Title */}
                <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                        src={`${import.meta.env.BASE_URL}nododa_rajput.png`}
                        alt="શ્રી નાડોદા રાજપૂત સમાજ"
                        style={{
                            width: '42px',
                            height: '42px',
                            flexShrink: 0,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(245, 158, 11, 0.6)',
                            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                            background: '#1E293B'
                        }}
                    />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h1 style={{ fontSize: '1.15rem', fontWeight: '700', letterSpacing: '-0.01em', color: '#FFF' }}>
                                નાડોદા કનેક્ટ
                            </h1>
                            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: '400' }}>
                                Nadoda Connect
                            </span>
                            <span className="badge badge-amber hide-mobile" style={{ fontSize: '0.675rem' }}>
                                Directory
                            </span>
                        </div>
                        <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            શ્રી નાડોદા રાજપૂત સમાજ વસ્તી ગણતરી & વહીવટી પ્લેટફોર્મ
                        </p>
                    </div>
                </div>

                {/* Village Selector & Logged-in User Profile */}
                <div className="header-actions">
                    {/* Village Dropdown */}
                    <div style={{ position: 'relative', flex: '1 1 auto' }}>
                        <button
                            onClick={() => setVillageDropdownOpen(!villageDropdownOpen)}
                            className="village-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                padding: '8px 12px',
                                width: '100%',
                                background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-hover)',
                                borderRadius: 'var(--radius-md)',
                                color: '#FFF',
                                fontSize: '0.825rem',
                                fontWeight: '500'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                <MapPin size={15} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    ગામ: <strong>{selectedVillage?.name?.gu || 'બાસ્પા'}</strong>
                                </span>
                            </div>
                            <ChevronDown size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                        </button>

                        {villageDropdownOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '110%',
                                    left: 0,
                                    minWidth: '240px',
                                    maxWidth: '90vw',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-hover)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 200,
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                                    SELECT VILLAGE / ગામ પસંદ કરો
                                </div>
                                {villages.map((v) => (
                                    <div
                                        key={v._id}
                                        onClick={() => {
                                            setSelectedVillage(v);
                                            setVillageDropdownOpen(false);
                                        }}
                                        style={{
                                            padding: '10px 14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            background: selectedVillage?._id === v._id ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                                            color: selectedVillage?._id === v._id ? 'var(--accent-amber)' : 'var(--text-primary)',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <div>
                                            <strong>{v.name.gu}</strong> ({v.name.en})
                                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                                તા. {v.taluka?.gu || 'સમી'}, જિ. {v.district?.gu || 'પાટણ'}
                                            </div>
                                        </div>
                                        {selectedVillage?._id === v._id && <Check size={16} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Logged in User Badge & Logout */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isSuperAdmin
                                ? 'rgba(245, 158, 11, 0.2)'
                                : isVillageAdmin
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(16, 185, 129, 0.2)',
                            color: isSuperAdmin
                                ? '#FBBF24'
                                : isVillageAdmin
                                ? '#60A5FA'
                                : '#34D399',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {isSuperAdmin ? <ShieldAlert size={16} /> : isVillageAdmin ? <Shield size={16} /> : <User size={16} />}
                        </div>

                        <div>
                            <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#FFF' }}>
                                {user?.name || user?.mobileNumber || 'User'}
                            </div>
                            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                                {isSuperAdmin ? '👑 Super Admin' : isVillageAdmin ? '🏛️ Village Admin' : '👤 Member'} • {user?.mobileNumber}
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            title="લૉગઆઉટ કરો (Logout)"
                            style={{
                                marginLeft: '8px',
                                padding: '6px',
                                borderRadius: '6px',
                                background: 'rgba(244, 63, 94, 0.12)',
                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                color: '#FB7185',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            <LogOut size={13} />
                            <span>લૉગઆઉટ</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="header-nav-tabs">
                <button
                    onClick={() => setActiveTab('hierarchy')}
                    className={`nav-tab-btn ${activeTab === 'hierarchy' ? 'active' : ''}`}
                >
                    <Building2 size={16} />
                    <span>ગામ વંશાવળી / Hierarchy</span>
                    <span className="badge badge-amber hide-mobile" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Ataks & Families</span>
                </button>

                <button
                    onClick={() => setActiveTab('members')}
                    className={`nav-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                >
                    <User size={16} />
                    <span>તમામ સભ્યો / Directory</span>
                </button>

                <button
                    onClick={() => setActiveTab('my-family')}
                    className={`nav-tab-btn ${activeTab === 'my-family' ? 'active' : ''}`}
                >
                    <span>🏠 મારું કુટુંબ / My Family</span>
                    <span className="badge badge-emerald hide-mobile" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        Self-Update
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('demographics')}
                    className={`nav-tab-btn ${activeTab === 'demographics' ? 'active' : ''}`}
                >
                    <span>📊 આંકડા / Stats</span>
                </button>

                {(isSuperAdmin || isVillageAdmin) && (
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                    >
                        <Shield size={16} />
                        <span>વહીવટી પોર્ટલ / Admin</span>
                        <span className="badge badge-emerald hide-mobile" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            {isSuperAdmin ? 'Super' : 'Village Admin'}
                        </span>
                    </button>
                )}
            </div>
        </header>
    );
};
