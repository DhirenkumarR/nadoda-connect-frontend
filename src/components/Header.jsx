import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, User, ChevronDown, Check, Building2, MapPin, LogOut, KeyRound, Crown } from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

export const Header = ({
    activeTab,
    setActiveTab,
    villages = [],
    selectedVillage,
    setSelectedVillage
}) => {
    const { user, logout, isSuperAdmin, isVillageAdmin } = useAuth();
    const [villageDropdownOpen, setVillageDropdownOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    return (
        <header className="header-container">
            {/* Backdrop for open dropdowns on mobile/desktop */}
            {(villageDropdownOpen || userMenuOpen) && (
                <div
                    onClick={() => {
                        setVillageDropdownOpen(false);
                        setUserMenuOpen(false);
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 180,
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            <div className="header-top">
                {/* Brand / Title */}
                <div className="header-brand">
                    <img
                        src={`${import.meta.env.BASE_URL}nododa_rajput.png`}
                        alt="શ્રી નાડોદા રાજપૂત સમાજ"
                        className="header-brand-logo"
                    />
                    <div className="header-brand-text">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h1 className="header-brand-title">
                                નાડોદા રાજપૂત કનેક્ટ
                            </h1>
                            <span className="badge badge-amber hide-mobile" style={{ fontSize: '0.675rem' }}>
                                Directory
                            </span>
                        </div>
                        <p className="header-brand-desc hide-mobile">
                            શ્રી નાડોદા રાજપૂત સમાજ વસ્તી ગણતરી & વહીવટી પ્લેટફોર્મ
                        </p>
                    </div>
                </div>

                {/* Village Selector & User Profile */}
                <div className="header-actions">
                    {/* Village Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setVillageDropdownOpen(!villageDropdownOpen);
                                setUserMenuOpen(false);
                            }}
                            className="village-btn"
                            title="ગામ પસંદ કરો (Select Village)"
                        >
                            <MapPin size={14} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
                            <span className="village-btn-text">
                                {selectedVillage?.name?.gu || 'બાસ્પા'}
                            </span>
                            <ChevronDown size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                        </button>

                        {villageDropdownOpen && (
                            <div className="village-dropdown-menu">
                                <div style={{ padding: '8px 12px', fontSize: '0.725rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', fontWeight: '600' }}>
                                    ગામ પસંદ કરો / SELECT VILLAGE
                                </div>
                                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                    {villages.map((v) => (
                                        <div
                                            key={v._id}
                                            onClick={() => {
                                                setSelectedVillage(v);
                                                setVillageDropdownOpen(false);
                                            }}
                                            className="village-option-item"
                                            style={{
                                                background: selectedVillage?._id === v._id ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                                                color: selectedVillage?._id === v._id ? 'var(--accent-amber)' : 'var(--text-primary)'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                                                    {v.name.gu} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({v.name.en})</span>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    તા. {v.taluka?.gu || 'સમી'}, જિ. {v.district?.gu || 'પાટણ'}
                                                </div>
                                            </div>
                                            {selectedVillage?._id === v._id && <Check size={16} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop User Profile Card */}
                    <div className="desktop-user-card hide-mobile">
                        <div className="user-avatar-badge">
                            {isSuperAdmin ? <ShieldAlert size={16} /> : isVillageAdmin ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <div style={{ minWidth: '90px' }}>
                            <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#FFF', whiteSpace: 'nowrap' }}>
                                {user?.name || user?.mobileNumber || 'User'}
                            </div>
                            <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {isSuperAdmin ? '👑 Super Admin' : isVillageAdmin ? '🏛️ Village Admin' : '👤 Member'} • {user?.mobileNumber}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowChangePasswordModal(true)}
                            title="પાસવર્ડ બદલો (Change Password)"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px', fontSize: '0.725rem', gap: '4px', color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                        >
                            <KeyRound size={13} />
                            <span>પાસવર્ડ</span>
                        </button>

                        <button
                            onClick={logout}
                            title="લૉગઆઉટ કરો (Logout)"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px', fontSize: '0.725rem', gap: '4px', color: '#FB7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        >
                            <LogOut size={13} />
                            <span>લૉગઆઉટ</span>
                        </button>
                    </div>

                    {/* Mobile User Profile Trigger & Dropdown Menu */}
                    <div className="mobile-user-container hide-desktop" style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setUserMenuOpen(!userMenuOpen);
                                setVillageDropdownOpen(false);
                            }}
                            className="mobile-user-avatar-btn"
                            title="પ્રોફાઇલ મેનૂ (Profile Menu)"
                        >
                            {isSuperAdmin ? (
                                <Crown size={17} color="#FBBF24" />
                            ) : isVillageAdmin ? (
                                <Shield size={17} color="#60A5FA" />
                            ) : (
                                <User size={17} color="#34D399" />
                            )}
                        </button>

                        {userMenuOpen && (
                            <div className="mobile-user-dropdown-menu">
                                <div style={{
                                    padding: '12px 14px',
                                    borderBottom: '1px solid var(--border-subtle)',
                                    background: 'rgba(255, 255, 255, 0.03)'
                                }}>
                                    <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.9rem' }}>
                                        {user?.name || user?.mobileNumber || 'User'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {isSuperAdmin ? '👑 Super Admin' : isVillageAdmin ? '🏛️ Village Admin' : '👤 Member'}
                                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{user?.mobileNumber}</span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        ગામ: <strong>{selectedVillage?.name?.gu || 'બાસ્પા'}</strong>
                                    </div>
                                </div>

                                <div style={{ padding: '8px' }}>
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            setShowChangePasswordModal(true);
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '9px 12px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'transparent',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            border: 'none',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <KeyRound size={15} color="var(--accent-amber)" />
                                        <span>પાસવર્ડ બદલો (Change Password)</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            logout();
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '9px 12px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'rgba(244, 63, 94, 0.1)',
                                            color: '#FB7185',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(244, 63, 94, 0.2)',
                                            marginTop: '6px',
                                            textAlign: 'left',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <LogOut size={15} />
                                        <span>લૉગઆઉટ કરો (Logout)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <nav className="header-nav-tabs">
                <button
                    onClick={() => setActiveTab('hierarchy')}
                    className={`nav-tab-btn ${activeTab === 'hierarchy' ? 'active' : ''}`}
                >
                    <Building2 size={15} />
                    <span>ગામ વંશાવળી / Hierarchy</span>
                    <span className="badge badge-amber hide-mobile" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Ataks & Families</span>
                </button>

                <button
                    onClick={() => setActiveTab('members')}
                    className={`nav-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                >
                    <User size={15} />
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
                        <Shield size={15} />
                        <span>વહીવટી પોર્ટલ / Admin</span>
                        <span className="badge badge-emerald hide-mobile" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            {isSuperAdmin ? 'Super' : 'Village Admin'}
                        </span>
                    </button>
                )}
            </nav>

            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
            />
        </header>
    );
};
