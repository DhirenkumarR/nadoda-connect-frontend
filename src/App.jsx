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
import { villageApi } from './services/api';

const VALID_TABS = ['hierarchy', 'members', 'my-family', 'demographics', 'admin'];

const getTabFromUrl = () => {
    // 1. Check path (e.g. /members, /admin)
    const path = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
    if (VALID_TABS.includes(path)) return path;

    // 2. Check hash (e.g. #/members, #admin)
    const hash = window.location.hash.replace(/^#\/?/, '').split('/')[0].toLowerCase();
    if (VALID_TABS.includes(hash)) return hash;

    // 3. Check localStorage
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
        const targetUrl = `/${newTab}`;
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
                window.history.replaceState({ tab: 'hierarchy' }, '', '/hierarchy');
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
        if (isAuthenticated) {
            const currentPath = window.location.pathname.replace(/^\/+/, '').toLowerCase();
            if (!currentPath && activeTab) {
                window.history.replaceState({ tab: activeTab }, '', `/${activeTab}`);
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
                            પ્લેટફોર્મ ડેટા લોડ થઈ રહ્યો છે... (Loading Nadoda Connect)
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
                    </>
                )}
            </main>

            {/* Modals */}
            {detailMember && (
                <MemberDetailModal
                    member={detailMember}
                    onClose={() => setDetailMember(null)}
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
                        if (detailMember && updatedMem && String(detailMember._id) === String(updatedMem._id)) {
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
                padding: '18px 24px',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
            }}>
                <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <strong>શ્રી નાડોદા રાજપૂત સમાજ</strong> • Nadoda Connect Platform
                    </div>
                    <div>
                        ડેટાબેઝ આધારિત વહીવટ & વંશાવળી નિર્દેશિકા • Digital Community Directory
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
