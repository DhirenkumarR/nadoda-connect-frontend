import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    Users,
    Home,
    MapPin,
    Phone,
    UserCheck,
    Search,
    Plus,
    Edit,
    ArrowLeft,
    Sparkles,
    ShieldCheck,
    Shuffle,
    Trash2
} from 'lucide-react';
import { familyApi, memberApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MoveMembersModal } from './MoveMembersModal';

export const HierarchyView = ({
    village,
    villageStats,
    refreshTrigger = 0,
    onSelectMember,
    onAddFamily,
    onAddMember,
    onEditFamily,
    onEditMember
}) => {
    const { canManageVillage, isSuperAdmin, isVillageAdmin } = useAuth();
    const canManage = village?._id ? canManageVillage(village._id) : false;

    // Hierarchy navigation state
    // selectedAtak: object or null
    // selectedFamily: object or null
    const [selectedAtak, setSelectedAtak] = useState(null);
    const [selectedFamily, setSelectedFamily] = useState(null);

    // Families list state for Level 2
    const [families, setFamilies] = useState([]);
    const [loadingFamilies, setLoadingFamilies] = useState(false);
    const [familyPage, setFamilyPage] = useState(1);
    const [familyTotalPages, setFamilyTotalPages] = useState(1);
    const [familyTotalCount, setFamilyTotalCount] = useState(0);
    const [familySearch, setFamilySearch] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    // Family details & members list state for Level 3
    const [familyDetail, setFamilyDetail] = useState(null);
    const [loadingFamilyDetail, setLoadingFamilyDetail] = useState(false);

    // Move Members Modal state
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [moveTargetMemberIds, setMoveTargetMemberIds] = useState([]);

    // Fetch family details and members
    const fetchFamilyDetail = async (famId = selectedFamily?._id) => {
        if (!famId) return;
        setLoadingFamilyDetail(true);
        try {
            const res = await familyApi.getById(famId);
            if (res.success) {
                setFamilyDetail(res.data);
            }
        } catch (err) {
            console.error('Error fetching family detail:', err);
        } finally {
            setLoadingFamilyDetail(false);
        }
    };

    const handleDeleteMember = async (mem) => {
        const name = mem.fullName?.gu || mem.fullName?.en || 'આ સભ્ય';
        const confirmDelete = window.confirm(`શું તમે ખરેખર સભ્ય "${name}" ને ડિલીટ કરવા માંગો છો?\nAre you sure you want to delete member "${name}"?`);
        if (!confirmDelete) return;

        try {
            await memberApi.delete(mem._id);
            if (selectedFamily?._id) {
                fetchFamilyDetail(selectedFamily._id);
            }
            // Refetch families to update total counts
            setFamilyPage(1);
        } catch (err) {
            alert(err.response?.message || err.message || 'સભ્ય ડિલીટ કરવામાં ભૂલ આવી.');
        }
    };

    // Reset hierarchy when village changes
    useEffect(() => {
        setSelectedAtak(null);
        setSelectedFamily(null);
        setFamilyPage(1);
        setFamilySearch('');
        setCityFilter('');
    }, [village?._id]);

    const fetchFamilies = async () => {
        if (!village?._id || !selectedAtak) return;
        setLoadingFamilies(true);
        try {
            const res = await familyApi.getAll({
                villageId: village._id,
                atak: selectedAtak.atak.gu,
                search: familySearch,
                city: cityFilter,
                page: familyPage,
                limit: 12
            });
            if (res.success) {
                setFamilies(res.data);
                setFamilyTotalPages(res.pages || 1);
                setFamilyTotalCount(res.total || 0);
            }
        } catch (err) {
            console.error('Error fetching families:', err);
        } finally {
            setLoadingFamilies(false);
        }
    };

    // Fetch families when selectedAtak or page or search changes
    useEffect(() => {
        if (village?._id && selectedAtak) {
            fetchFamilies();
        }
    }, [village?._id, selectedAtak, familyPage, familySearch, cityFilter]);

    // Fetch family details and members when selectedFamily changes
    useEffect(() => {
        if (selectedFamily?._id) {
            fetchFamilyDetail(selectedFamily._id);
        }
    }, [selectedFamily?._id]);

    // When global refreshTrigger changes (e.g. member added/updated/deleted), refresh data immediately
    useEffect(() => {
        if (selectedFamily?._id) {
            fetchFamilyDetail(selectedFamily._id);
        }
        if (selectedAtak) {
            fetchFamilies();
        }
    }, [refreshTrigger]);

    const ataksList = villageStats?.ataks || village?.registeredAtaks || [];

    // Unique cities from topCities for quick filter
    const citiesList = villageStats?.demographics?.topCities?.map(c => c._id) || [
        'બાસ્પા', 'અમદાવાદ', 'ગાંધીધામ', 'સુરત', 'રાધનપુર', 'પાટણ'
    ];

    return (
        <div className="animate-fade">
            {/* Interactive Breadcrumb Bar */}
            <div className="glass-panel" style={{
                padding: '12px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                fontSize: '0.875rem'
            }}>
                <button
                    onClick={() => {
                        setSelectedAtak(null);
                        setSelectedFamily(null);
                    }}
                    style={{
                        color: !selectedAtak ? 'var(--accent-amber)' : 'var(--text-secondary)',
                        fontWeight: !selectedAtak ? '700' : '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Home size={15} />
                    <span>ગામ: {village?.name?.gu} ({village?.name?.en})</span>
                </button>

                {selectedAtak && (
                    <>
                        <ChevronRight size={14} color="var(--text-muted)" />
                        <button
                            onClick={() => setSelectedFamily(null)}
                            style={{
                                color: !selectedFamily ? 'var(--accent-amber)' : 'var(--text-secondary)',
                                fontWeight: !selectedFamily ? '700' : '500'
                            }}
                        >
                            અટક: {selectedAtak.atak.gu} ({selectedAtak.atak.en})
                        </button>
                    </>
                )}

                {selectedFamily && (
                    <>
                        <ChevronRight size={14} color="var(--text-muted)" />
                        <span style={{ color: 'var(--accent-amber)', fontWeight: '700' }}>
                            ઘર નં. {selectedFamily.houseNumber} ({selectedFamily.headMemberId?.fullName?.gu || selectedFamily.headMemberId?.fullName?.en || 'કુટુંબ'})
                        </span>
                    </>
                )}

                {/* Scope status pill */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {canManage ? (
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                            <ShieldCheck size={12} /> Manageable by you ({isSuperAdmin ? 'Super Admin' : 'Village Admin'})
                        </span>
                    ) : (
                        <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                            View Only
                        </span>
                    )}
                </div>
            </div>

            {/* LEVEL 1: ATAK GRID */}
            {!selectedAtak && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFF' }}>
                                ૧. અટક મુજબ વિભાજન (Atak Breakdown in {village?.name?.gu || 'બાસ્પા'})
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                કોઈપણ અટક પર ક્લિક કરીને તે અટકના તમામ પરિવારો અને સભ્યો જુઓ (Click an Atak to explore families)
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px'
                    }}>
                        {ataksList.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setSelectedAtak(item);
                                    setFamilyPage(1);
                                }}
                                className="glass-panel"
                                style={{
                                    padding: '20px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--border-subtle)',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.borderColor = 'var(--border-active)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#FFF' }}>
                                            {item.atak?.gu}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: '500' }}>
                                            {item.atak?.en}
                                        </div>
                                    </div>
                                    <span className="badge badge-amber" style={{ fontSize: '0.725rem' }}>
                                        {item.totalHouses} ઘરો
                                    </span>
                                </div>

                                {item.kuldevi?.gu && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '6px 10px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'rgba(245, 158, 11, 0.08)',
                                        border: '1px solid rgba(245, 158, 11, 0.2)',
                                        fontSize: '0.75rem',
                                        color: 'var(--accent-amber-light)'
                                    }}>
                                        🚩 કુળદેવી: <strong>{item.kuldevi.gu}</strong>
                                    </div>
                                )}

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '8px',
                                    marginTop: '16px',
                                    textAlign: 'center',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--border-subtle)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>કુલ સભ્યો</div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF' }}>
                                            {item.totalMembers}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>પુરુષ</div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#38BDF8' }}>
                                            {item.totalMale}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>સ્ત્રી</div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FB7185' }}>
                                            {item.totalFemale}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '4px',
                                    fontSize: '0.775rem',
                                    fontWeight: '600',
                                    color: 'var(--accent-amber)'
                                }}>
                                    <span>પરિવારો જુઓ (Explore Families)</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* LEVEL 2: FAMILIES IN SELECTED ATAK */}
            {selectedAtak && !selectedFamily && (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => setSelectedAtak(null)}
                                className="btn btn-secondary btn-sm"
                            >
                                <ArrowLeft size={14} /> પાછા જાઓ
                            </button>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FFF' }}>
                                    ૨. {selectedAtak.atak.gu} ({selectedAtak.atak.en}) - પરિવારોની યાદી
                                </h3>
                                <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                                    કુલ {familyTotalCount} ઘરો • કુળદેવી: {selectedAtak.kuldevi?.gu || '-'}
                                </p>
                            </div>
                        </div>

                        {/* Admin Action: Add New Family */}
                        {canManage && (
                            <button
                                onClick={() => onAddFamily && onAddFamily(village, selectedAtak)}
                                className="btn btn-primary btn-sm"
                            >
                                <Plus size={15} /> નવું કુટુંબ ઉમેરો (Add Family)
                            </button>
                        )}
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="glass-panel" style={{
                        padding: '14px 18px',
                        marginBottom: '16px',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <div style={{ flex: '1 1 240px', position: 'relative' }}>
                            <Search size={16} color="var(--text-muted)" style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }} />
                            <input
                                type="text"
                                placeholder="ઘર નંબર, મુખ્ય વ્યક્તિનું નામ કે મોબાઈલ શોધો..."
                                value={familySearch}
                                onChange={(e) => {
                                    setFamilySearch(e.target.value);
                                    setFamilyPage(1);
                                }}
                                className="form-input"
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>

                        <div style={{ width: '200px' }}>
                            <select
                                value={cityFilter}
                                onChange={(e) => {
                                    setCityFilter(e.target.value);
                                    setFamilyPage(1);
                                }}
                                className="form-select"
                            >
                                <option value="">તમામ શહેરો / All Cities</option>
                                {citiesList.map((c, i) => (
                                    <option key={i} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Families Grid */}
                    {loadingFamilies ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            પરિવારો લોડ થઈ રહ્યા છે... (Loading families)
                        </div>
                    ) : families.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>આ શોધ માટે કોઈ કુટુંબ મળ્યું નથી.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '16px'
                        }}>
                            {families.map((fam) => (
                                <div
                                    key={fam._id}
                                    className="glass-panel"
                                    style={{
                                        padding: '18px',
                                        border: '1px solid var(--border-subtle)',
                                        transition: 'all 0.2s ease',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="badge badge-amber" style={{ fontSize: '0.8rem', fontWeight: '700' }}>
                                                ઘર નં. {fam.houseNumber}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                (House #{fam.houseNumber})
                                            </span>
                                        </div>
                                        <span className="badge badge-blue">
                                            <Users size={12} /> {fam.totalMembersCount || 0} સભ્યો
                                        </span>
                                    </div>

                                    {/* Head of household */}
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                            મુખ્ય સભ્ય (Head of Household):
                                        </div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF' }}>
                                            {fam.headMemberId?.fullName?.gu || '-'}
                                        </div>
                                        {fam.headMemberId?.fullName?.en && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {fam.headMemberId.fullName.en}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: '0.785rem',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={13} color="var(--accent-amber)" />
                                            <span>
                                                હાલનું શહેર: <strong>{fam.address?.currentCity?.gu || 'બાસ્પા'}</strong>
                                                {fam.address?.streetAddress ? ` (${fam.address.streetAddress})` : ''}
                                            </span>
                                        </div>
                                        {(fam.primaryMobile || fam.headMemberId?.mobileNumber) && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Phone size={13} color="#34D399" />
                                                <span>મોબાઈલ: {fam.primaryMobile || fam.headMemberId?.mobileNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom action buttons */}
                                    <div style={{
                                        marginTop: '14px',
                                        paddingTop: '12px',
                                        borderTop: '1px solid var(--border-subtle)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <button
                                            onClick={() => setSelectedFamily(fam)}
                                            className="btn btn-secondary btn-sm"
                                            style={{ color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                                        >
                                            <span>સભ્યો જુઓ ({fam.totalMembersCount || 0})</span>
                                            <ChevronRight size={14} />
                                        </button>

                                        {canManage && (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => onEditFamily && onEditFamily(fam)}
                                                    className="btn btn-secondary btn-sm"
                                                    title="Edit Family"
                                                >
                                                    <Edit size={13} />
                                                </button>
                                                <button
                                                    onClick={() => onAddMember && onAddMember(village, fam)}
                                                    className="btn btn-primary btn-sm"
                                                    title="Add Member to this family"
                                                >
                                                    <Plus size={13} /> સભ્ય
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {familyTotalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginTop: '24px'
                        }}>
                            <button
                                disabled={familyPage <= 1}
                                onClick={() => setFamilyPage(p => Math.max(1, p - 1))}
                                className="btn btn-secondary btn-sm"
                            >
                                ← પાછલું (Prev)
                            </button>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                પેજ {familyPage} / {familyTotalPages} (કુલ {familyTotalCount} ઘરો)
                            </span>
                            <button
                                disabled={familyPage >= familyTotalPages}
                                onClick={() => setFamilyPage(p => Math.min(familyTotalPages, p + 1))}
                                className="btn btn-secondary btn-sm"
                            >
                                આગળનું (Next) →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* LEVEL 3: FAMILY ROSTER & MEMBERS LIST */}
            {selectedFamily && (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => setSelectedFamily(null)}
                                className="btn btn-secondary btn-sm"
                            >
                                <ArrowLeft size={14} /> પાછા જાઓ (પરિવારોની યાદી)
                            </button>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                                    ૩. ઘર નંબર {selectedFamily.houseNumber} - સભ્યોની યાદી (Family Roster)
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    અટક: {selectedFamily.atak?.gu} ({selectedFamily.atak?.en}) • કુળદેવી: {selectedFamily.kuldevi?.gu || '-'}
                                </p>
                            </div>
                        </div>

                        {/* Admin Action: Add member to this family or Move members */}
                        {canManage && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => {
                                        setMoveTargetMemberIds([]);
                                        setMoveModalOpen(true);
                                    }}
                                    className="btn btn-secondary btn-sm"
                                    style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--accent-amber)' }}
                                    title="Move members between families or into a new family"
                                >
                                    <Shuffle size={14} /> સભ્યો ખસેડો / નવું કુટુંબ (Move Members)
                                </button>
                                <button
                                    onClick={() => onAddMember && onAddMember(village, selectedFamily)}
                                    className="btn btn-primary btn-sm"
                                >
                                    <Plus size={15} /> નવો સભ્ય ઉમેરો (Add Member)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Family Card Banner */}
                    <div className="glass-panel" style={{
                        padding: '18px 22px',
                        marginBottom: '20px',
                        background: 'linear-gradient(135deg, rgba(27, 41, 75, 0.6) 0%, rgba(19, 30, 54, 0.8) 100%)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '14px',
                        fontSize: '0.825rem'
                    }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>મુખ્ય વ્યક્તિ:</span>
                            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFF' }}>
                                {familyDetail?.headMemberId?.fullName?.gu || selectedFamily.headMemberId?.fullName?.gu || '-'}
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>હાલનું રહેઠાણ:</span>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                {selectedFamily.address?.currentCity?.gu || 'બાસ્પા'}
                                {selectedFamily.address?.streetAddress ? ` - ${selectedFamily.address.streetAddress}` : ''}
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>પ્રાથમિક મોબાઈલ:</span>
                            <div style={{ color: '#34D399', fontWeight: '600' }}>
                                {selectedFamily.primaryMobile || familyDetail?.headMemberId?.mobileNumber || '-'}
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>કુલ સભ્યો:</span>
                            <div style={{ color: 'var(--accent-amber)', fontWeight: '700', fontSize: '1.05rem' }}>
                                {familyDetail?.members?.length || selectedFamily.totalMembersCount || 0} સભ્યો
                            </div>
                        </div>
                    </div>

                    {/* Members Table */}
                    {loadingFamilyDetail ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            સભ્યોની માહિતી લોડ થઈ રહી છે... (Loading members)
                        </div>
                    ) : familyDetail?.members?.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>આ કુટુંબમાં હજુ સુધી કોઈ સભ્ય નોંધાયેલ નથી.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="glass-panel hide-mobile" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{
                                            borderBottom: '1px solid var(--border-hover)',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            fontSize: '0.725rem',
                                            letterSpacing: '0.05em'
                                        }}>
                                            <th style={{ padding: '12px 14px' }}>અ.નં.</th>
                                            <th style={{ padding: '12px 14px' }}>સળંગ ક્રમ</th>
                                            <th style={{ padding: '12px 14px' }}>સભ્યનું નામ</th>
                                            <th style={{ padding: '12px 14px' }}>સંબંધ</th>
                                            <th style={{ padding: '12px 14px' }}>જાતિ / ઉંમર</th>
                                            <th style={{ padding: '12px 14px' }}>અભ્યાસ</th>
                                            <th style={{ padding: '12px 14px' }}>લગ્ન સ્થિતિ</th>
                                            <th style={{ padding: '12px 14px' }}>વ્યવસાય & સ્થળ</th>
                                            <th style={{ padding: '12px 14px' }}>મોબાઈલ</th>
                                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>ક્રિયા</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {familyDetail?.members?.map((mem) => {
                                            const isMale = mem.gender?.key === 'male';
                                            return (
                                                <tr
                                                    key={mem._id}
                                                    style={{
                                                        borderBottom: '1px solid var(--border-subtle)',
                                                        transition: 'background 0.15s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                        {mem.memberOrder || '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                                                        {mem.serialNumber ? `#${mem.serialNumber}` : '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 14px' }}>
                                                        <div style={{ fontWeight: '700', color: '#FFF' }}>
                                                            {mem.fullName?.gu}
                                                            {mem.isFamilyHead && (
                                                                <span className="badge badge-amber" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                                                                    મુખ્ય
                                                                </span>
                                                            )}
                                                        </div>
                                                        {mem.fullName?.en && (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                                {mem.fullName.en}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                                                        <span className="badge badge-slate">
                                                            {mem.relationWithHead?.gu || '-'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 14px' }}>
                                                        <span className={`badge ${isMale ? 'badge-blue' : 'badge-rose'}`} style={{ fontSize: '0.725rem' }}>
                                                            {mem.gender?.gu || (isMale ? 'પુરુષ' : 'સ્ત્રી')}
                                                        </span>
                                                        <span style={{ marginLeft: '6px', color: 'var(--text-secondary)' }}>
                                                            {mem.age ? `${mem.age} વ.` : '-'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                                                        {mem.education?.qualification || '-'}
                                                        {mem.education?.isStudying && (
                                                            <span className="badge badge-emerald" style={{ marginLeft: '4px', fontSize: '0.65rem' }}>
                                                                ચાલુ
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                                                        {mem.maritalStatus?.gu || '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 14px' }}>
                                                        <div style={{ color: 'var(--text-primary)' }}>
                                                            {mem.occupation?.title || '-'}
                                                        </div>
                                                        {mem.occupation?.workCity && (
                                                            <div style={{ fontSize: '0.725rem', color: 'var(--accent-amber)' }}>
                                                                📍 {mem.occupation.workCity}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px 14px', color: '#34D399', fontWeight: '500' }}>
                                                        {mem.mobileNumber || '-'}
                                                    </td>
                                                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                            <button
                                                                onClick={() => onSelectMember && onSelectMember(mem)}
                                                                className="btn btn-secondary btn-sm"
                                                                style={{ fontSize: '0.725rem' }}
                                                                title="View Profile Details"
                                                            >
                                                                પ્રોફાઇલ
                                                            </button>
                                                            {canManage && (
                                                                <>
                                                                    <button
                                                                        onClick={() => onEditMember && onEditMember(mem)}
                                                                        className="btn btn-secondary btn-sm"
                                                                        style={{ padding: '4px 8px' }}
                                                                        title="Edit Member"
                                                                    >
                                                                        <Edit size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setMoveTargetMemberIds([mem._id]);
                                                                            setMoveModalOpen(true);
                                                                        }}
                                                                        className="btn btn-secondary btn-sm"
                                                                        style={{ padding: '4px 8px', color: 'var(--accent-amber)' }}
                                                                        title="Move this member to another family"
                                                                    >
                                                                        <Shuffle size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteMember(mem)}
                                                                        className="btn btn-secondary btn-sm"
                                                                        style={{ padding: '4px 8px', color: '#FB7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                                                                        title="Delete Member"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="show-mobile">
                                {familyDetail?.members?.map((mem) => {
                                    const isMale = mem.gender?.key === 'male';
                                    return (
                                        <div key={mem._id} className="mobile-member-card">
                                            <div className="mobile-member-card-header">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: '10px',
                                                        background: isMale ? 'rgba(59, 130, 246, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                                        color: isMale ? '#60A5FA' : '#FB7185',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: '700',
                                                        fontSize: '1rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {mem.fullName?.gu ? mem.fullName.gu.charAt(0) : 'સ'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.95rem' }}>
                                                            {mem.fullName?.gu}
                                                            {mem.isFamilyHead && (
                                                                <span className="badge badge-amber" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                                                                    મુખ્ય
                                                                </span>
                                                            )}
                                                        </div>
                                                        {mem.fullName?.en && (
                                                            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                                                                {mem.fullName.en}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="badge badge-slate" style={{ fontSize: '0.725rem' }}>
                                                    {mem.relationWithHead?.gu || '-'}
                                                </span>
                                            </div>

                                            <div className="mobile-member-card-body">
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)' }}>જાતિ/ઉંમર: </span>
                                                    <strong>{mem.gender?.gu}</strong> {mem.age ? `• ${mem.age} વ.` : ''}
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)' }}>સ્થિતિ: </span>
                                                    <span>{mem.maritalStatus?.gu || '-'}</span>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)' }}>અભ્યાસ: </span>
                                                    <span>{mem.education?.qualification || '-'}</span>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--text-muted)' }}>વ્યવસાય: </span>
                                                    <span>{mem.occupation?.title || '-'}</span>
                                                </div>
                                            </div>

                                            {mem.mobileNumber && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0 4px' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>મોબાઈલ નંબર:</span>
                                                    <a href={`tel:${mem.mobileNumber}`} className="tel-link">
                                                        <Phone size={13} /> {mem.mobileNumber}
                                                    </a>
                                                </div>
                                            )}

                                            <div className="mobile-member-card-actions">
                                                <button
                                                    onClick={() => onSelectMember && onSelectMember(mem)}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ flex: 1, padding: '7px 10px' }}
                                                >
                                                    પ્રોફાઇલ જુઓ
                                                </button>
                                                {canManage && (
                                                    <>
                                                        <button
                                                            onClick={() => onEditMember && onEditMember(mem)}
                                                            className="btn btn-secondary btn-sm"
                                                            style={{ padding: '7px 12px' }}
                                                            title="Edit"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setMoveTargetMemberIds([mem._id]);
                                                                setMoveModalOpen(true);
                                                            }}
                                                            className="btn btn-secondary btn-sm"
                                                            style={{ padding: '7px 12px', color: 'var(--accent-amber)' }}
                                                            title="Move Family"
                                                        >
                                                            <Shuffle size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMember(mem)}
                                                            className="btn btn-secondary btn-sm"
                                                            style={{ padding: '7px 12px', color: '#FB7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Move Members Modal */}
            {moveModalOpen && (
                <MoveMembersModal
                    isOpen={moveModalOpen}
                    onClose={() => setMoveModalOpen(false)}
                    sourceFamily={familyDetail || selectedFamily}
                    initialSelectedMemberIds={moveTargetMemberIds}
                    village={village}
                    onSuccess={() => {
                        fetchFamilyDetail();
                        // Refetch families list for Level 2
                        setFamilyPage(1);
                    }}
                />
            )}
        </div>
    );
};
