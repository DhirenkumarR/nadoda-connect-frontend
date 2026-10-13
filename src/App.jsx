import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { VillageStatsBar } from './components/VillageStatsBar';
import { HierarchyView } from './components/HierarchyView';
import { MembersDirectory } from './components/MembersDirectory';
import { DemographicsView } from './components/DemographicsView';
import { AdminPortal } from './components/AdminPortal';
import { MyFamilyView } from './components/MyFamilyView';
import { MemberDetailModal } from './components/MemberDetailModal';
import { FamilyFormModal } from './components/FamilyFormModal';
import { MemberFormModal } from './components/MemberFormModal';
import { NotFoundScreen } from './components/NotFoundScreen';
import { villageApi, memberApi } from './services/api';

const VALID_TABS = ['hierarchy', 'members', 'my-family', 'demographics', 'admin'];
const BASE_PATH = import.meta.env.BASE_URL || '/';

const buildTabUrl = (tab) => {
    const base = BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`;
    return `${base}${tab}`;
};

const getTabFromUrl = () => {
    // 1. Check path (e.g. /nadoda-connect-frontend/members or /members)
    let pathname = window.location.pathname;
    if (BASE_PATH !== '/' && pathname.startsWith(BASE_PATH)) {
        pathname = pathname.slice(BASE_PATH.length);
    }
    const cleanPath = pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
    if (cleanPath && VALID_TABS.includes(cleanPath)) return cleanPath;

    // 2. Check hash (e.g. #/members, #members)
    const hash = window.location.hash.replace(/^#\/?/, '').split('/')[0].toLowerCase();
    if (hash && VALID_TABS.includes(hash)) return hash;

    // 3. If there is a non-empty path or hash that is NOT a valid tab, mark as not-found
    if (cleanPath && !['', 'index.html', '404.html'].includes(cleanPath)) {
        return 'not-found';
    }
    if (hash && hash !== '') {
        return 'not-found';
    }

    // 4. Check localStorage fallback
    const saved = localStorage.getItem('nadoda_active_tab');
    if (saved && VALID_TABS.includes(saved)) return saved;

    return 'hierarchy';
};

function AppContent() {
    const { isAuthenticated, initialCheckDone, isSuperAdmin, isVillageAdmin } = useAuth();

    // Navigation state synced with URL
    const [activeTab, setActiveTabState] = useState(getTabFromUrl);

    // Global data version to force refresh in all views when members/families change
    const [dataVersion, setDataVersion] = useState(0);

    // Tab change handler that updates URL without reloading
    const handleTabChange = (newTab) => {
        if (!VALID_TABS.includes(newTab)) return;
        if (newTab === 'admin' && !isSuperAdmin && !isVillageAdmin) return;
        setActiveTabState(newTab);
        localStorage.setItem('nadoda_active_tab', newTab);
        const targetUrl = buildTabUrl(newTab);
        if (window.location.pathname !== targetUrl) {
            window.history.pushState({ tab: newTab }, '', targetUrl);
        }
    };

    // Redirect regular members away from 'admin' if they land on it
    useEffect(() => {
        if (isAuthenticated && !isSuperAdmin && !isVillageAdmin && activeTab === 'admin') {
            handleTabChange('hierarchy');
        }
    }, [isAuthenticated, isSuperAdmin, isVillageAdmin, activeTab]);

    // Listen to browser Back/Forward (popstate) and Hash changes
    useEffect(() => {
        const onLocationChange = () => {
            const tab = getTabFromUrl();
            if (tab === 'admin' && !isSuperAdmin && !isVillageAdmin) {
                setActiveTabState('hierarchy');
                window.history.replaceState({ tab: 'hierarchy' }, '', buildTabUrl('hierarchy'));
                return;
            }
            setActiveTabState(tab);
        };
        window.addEventListener('popstate', onLocationChange);
        window.addEventListener('hashchange', onLocationChange);
        return () => {
            window.removeEventListener('popstate', onLocationChange);
            window.removeEventListener('hashchange', onLocationChange);
        };
    }, [isSuperAdmin, isVillageAdmin]);

    // Keep URL path in sync on authenticated start
    useEffect(() => {
        if (isAuthenticated && VALID_TABS.includes(activeTab)) {
            const currentPath = window.location.pathname;
            const targetUrl = buildTabUrl(activeTab);
            if (currentPath !== targetUrl) {
                window.history.replaceState({ tab: activeTab }, '', targetUrl);
            }
        }
    }, [isAuthenticated, activeTab]);

    // Villages data
    const [villages, setVillages] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [villageStats, setVillageStats] = useState(null);
    const [loadingVillage, setLoadingVillage] = useState(true);

    // Modals
    const [detailMember, setDetailMember] = useState(null);
    const [familyModal, setFamilyModal] = useState({ isOpen: false, initialAtak: null, familyToEdit: null });
    const [memberModal, setMemberModal] = useState({ isOpen: false, family: null, memberToEdit: null });

    // Navigation target for HierarchyView
    const [targetFamily, setTargetFamily] = useState(null);

    const handleGoToFamily = (familyIdOrObj) => {
        if (!familyIdOrObj) return;
        setTargetFamily(familyIdOrObj);
        setActiveTabState('hierarchy');
        localStorage.setItem('nadoda_active_tab', 'hierarchy');
        const targetUrl = buildTabUrl('hierarchy');
        if (window.location.pathname !== targetUrl) {
            window.history.pushState({ tab: 'hierarchy' }, '', targetUrl);
        }
        setDetailMember(null);
    };

    // Fetch villages when user is authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchVillages = async () => {
            setLoadingVillage(true);
            try {
                const res = await villageApi.getAll();
                if (res.success && res.data.length > 0) {
                    setVillages(res.data);
                    // Check if a village was previously selected
                    const savedSlug = localStorage.getItem('nadoda_selected_village_slug');
                    const matched = savedSlug ? res.data.find(v => v.slug === savedSlug || v._id === savedSlug) : null;
                    const baspa = matched || res.data.find(v => v.slug === 'baspa') || res.data[0];
                    setSelectedVillage(baspa);
                }
            } catch (err) {
                console.error('Failed to load villages:', err);
            } finally {
                setLoadingVillage(false);
            }
        };

        fetchVillages();
    }, [isAuthenticated]);

    const handleSelectVillage = (villageObj) => {
        setSelectedVillage(villageObj);
        if (villageObj?.slug || villageObj?._id) {
            localStorage.setItem('nadoda_selected_village_slug', villageObj.slug || villageObj._id);
        }
    };

    // Fetch stats whenever selectedVillage or dataVersion changes
    const fetchStats = async () => {
        if (!selectedVillage?._id || !isAuthenticated) return;
        try {
            const res = await villageApi.getStats(selectedVillage._id);
            if (res.success) {
                setVillageStats(res.data);
            }
        } catch (err) {
            console.error('Failed to load village stats:', err);
        }
    };

    // Global trigger to refresh all data across components
    const triggerRefresh = () => {
        setDataVersion(v => v + 1);
        fetchStats();
    };

    useEffect(() => {
        if (selectedVillage?._id && isAuthenticated) {
            fetchStats();
        }
    }, [selectedVillage?._id, isAuthenticated, dataVersion]);

    // Modal handlers
    const handleOpenAddFamily = (villageTarget, initialAtak = null) => {
        setFamilyModal({
            isOpen: true,
            initialAtak,
            familyToEdit: null
        });
    };

    const handleOpenEditFamily = (family) => {
        setFamilyModal({
            isOpen: true,
            initialAtak: null,
            familyToEdit: family
        });
    };

    const handleOpenAddMember = (villageTarget, family = null) => {
        setMemberModal({
            isOpen: true,
            family,
            memberToEdit: null
        });
    };

    const handleOpenEditMember = (member) => {
        setMemberModal({
            isOpen: true,
            family: member.familyId,
            memberToEdit: member
        });
    };

    const handleOpenDhirenProfile = async () => {
        try {
            const res = await memberApi.getById('6acb0d5d63ce8027eecd8ae8');
            if (res?.success && res?.data) {
                setDetailMember(res.data);
            } else {
                setDetailMember({ _id: '6acb0d5d63ce8027eecd8ae8' });
            }
        } catch (err) {
            console.error('Failed to load member profile:', err);
            setDetailMember({ _id: '6acb0d5d63ce8027eecd8ae8' });
        }
    };

    // If initial session check is loading
    if (!initialCheckDone) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 16px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0F172A',
                        fontWeight: '800',
                        fontSize: '1.4rem'
                    }}>
                        ના
                    </div>
                    <div>સુરક્ષા ચકાસણી ચાલુ છે... (Verifying Security Session)</div>
                </div>
            </div>
        );
    }

    // If not authenticated, render Login / Password setup screen
    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    // Authenticated View
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Header
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                villages={villages}
                selectedVillage={selectedVillage}
                setSelectedVillage={handleSelectVillage}
            />

            {/* Main Container */}
            <main className="app-main-container">
                {loadingVillage ? (
                    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                            પ્લેટફોર્મ ડેટા લોડ થઈ રહ્યો છે... (Loading Nadoda Rajput Connect)
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Village Stats Bar (Counts computed dynamically from DB) */}
                        <VillageStatsBar
                            village={selectedVillage}
                            stats={villageStats}
                            onRefresh={fetchStats}
                        />

                        {/* View Content depending on active tab */}
                        {activeTab === 'hierarchy' && (
                            <HierarchyView
                                village={selectedVillage}
                                villageStats={villageStats}
                                refreshTrigger={dataVersion}
                                targetFamily={targetFamily}
                                onClearTargetFamily={() => setTargetFamily(null)}
                                onSelectMember={setDetailMember}
                                onAddFamily={handleOpenAddFamily}
                                onAddMember={handleOpenAddMember}
                                onEditFamily={handleOpenEditFamily}
                                onEditMember={handleOpenEditMember}
                            />
                        )}

                        {activeTab === 'members' && (
                            <MembersDirectory
                                village={selectedVillage}
                                refreshTrigger={dataVersion}
                                onSelectMember={setDetailMember}
                                onGoToFamily={handleGoToFamily}
                                onAddMember={handleOpenAddMember}
                                onEditMember={handleOpenEditMember}
                            />
                        )}

                        {activeTab === 'my-family' && (
                            <MyFamilyView
                                village={selectedVillage}
                                refreshTrigger={dataVersion}
                                onSelectMember={setDetailMember}
                                onEditFamily={handleOpenEditFamily}
                                onAddMember={handleOpenAddMember}
                                onEditMember={handleOpenEditMember}
                            />
                        )}

                        {activeTab === 'demographics' && (
                            <DemographicsView
                                village={selectedVillage}
                                stats={villageStats}
                                refreshTrigger={dataVersion}
                            />
                        )}

                        {activeTab === 'admin' && (isSuperAdmin || isVillageAdmin) && (
                            <AdminPortal
                                village={selectedVillage}
                                villages={villages}
                                refreshTrigger={dataVersion}
                                onAddFamily={handleOpenAddFamily}
                                onAddMember={handleOpenAddMember}
                                onRefreshStats={triggerRefresh}
                            />
                        )}

                        {/* 404 / Not Found view */}
                        {!VALID_TABS.includes(activeTab) && (
                            <NotFoundScreen
                                onGoHome={() => handleTabChange('hierarchy')}
                                onNavigateTab={handleTabChange}
                            />
                        )}
                    </>
                )}
            </main>

            {/* Modals */}
            {detailMember && (
                <MemberDetailModal
                    member={detailMember}
                    village={selectedVillage}
                    onClose={() => setDetailMember(null)}
                    onGoToFamily={handleGoToFamily}
                    onEdit={(mem) => {
                        handleOpenEditMember(mem);
                    }}
                    onDeleted={() => {
                        setDetailMember(null);
                        triggerRefresh();
                    }}
                />
            )}

            {familyModal.isOpen && (
                <FamilyFormModal
                    village={selectedVillage}
                    initialAtak={familyModal.initialAtak}
                    familyToEdit={familyModal.familyToEdit}
                    onClose={() => setFamilyModal({ isOpen: false, initialAtak: null, familyToEdit: null })}
                    onSuccess={() => {
                        triggerRefresh();
                    }}
                />
            )}

            {memberModal.isOpen && (
                <MemberFormModal
                    village={selectedVillage}
                    family={memberModal.family}
                    memberToEdit={memberModal.memberToEdit}
                    onClose={() => setMemberModal({ isOpen: false, family: null, memberToEdit: null })}
                    onSuccess={(updatedMem) => {
                        triggerRefresh();
                        if (updatedMem && memberModal.memberToEdit) {
                            setDetailMember(updatedMem);
                        }
                    }}
                />
            )}

            {/* Footer */}
            <footer style={{
                marginTop: 'auto',
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(11, 17, 32, 0.95)',
                padding: '20px 24px',
                fontSize: '0.825rem',
                color: 'var(--text-muted)'
            }}>
                <div style={{
                    maxWidth: '1440px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>શ્રી નાડોદા રાજપૂત સમાજ</strong>
                        <span>•</span>
                        <span>Nadoda Rajput Connect Platform</span>
                        <span>•</span>
                        <span>Digital Community Directory</span>
                    </div>

                    <div style={{
                        fontSize: '0.785rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '6px'
                    }}>
                        <span>
                            © {new Date().getFullYear()} All rights reserved by{' '}
                            <button
                                onClick={handleOpenDhirenProfile}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0 2px',
                                    color: 'var(--accent-amber)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                    fontSize: 'inherit',
                                    transition: 'color 0.2s ease'
                                }}
                                title="સભ્ય પ્રોફાઇલ જુઓ (View Profile)"
                            >
                                Dhirenkumar Rathod
                            </button>
                        </span>
                        <span>•</span>
                        <span>
                            Created and developed by{' '}
                            <button
                                onClick={handleOpenDhirenProfile}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0 2px',
                                    color: 'var(--accent-amber)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                    fontSize: 'inherit',
                                    transition: 'color 0.2s ease'
                                }}
                                title="સભ્ય પ્રોફાઇલ જુઓ (View Profile)"
                            >
                                Dhirenkumar Rathod
                            </button>
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
