import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Users,
    Phone,
    MapPin,
    GraduationCap,
    Briefcase,
    Heart,
    SlidersHorizontal,
    Table as TableIcon,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
    Edit,
    Plus,
    UserCheck,
    Trash2
} from 'lucide-react';
import { memberApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MembersDirectory = ({
    village,
    onSelectMember,
    onAddMember,
    onEditMember,
    refreshTrigger = 0
}) => {
    const { canManageVillage, isSuperAdmin } = useAuth();
    const canManage = village?._id ? canManageVillage(village._id) : false;

    // Data state
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalMembers, setTotalMembers] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(25);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedAtak, setSelectedAtak] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [isHeadOnly, setIsHeadOnly] = useState(false);
    const [occupationCategory, setOccupationCategory] = useState('');
    const [workCity, setWorkCity] = useState('');

    // View mode: 'table' or 'grid'
    const [viewMode, setViewMode] = useState('table');

    const fetchMembers = async () => {
        if (!village?._id) return;
        setLoading(true);
        try {
            const res = await memberApi.getAll({
                villageId: village._id,
                atak: selectedAtak,
                gender: selectedGender,
                isHead: isHeadOnly ? 'true' : undefined,
                occupationCategory: occupationCategory || undefined,
                workCity: workCity || undefined,
                search: search.trim() || undefined,
                page,
                limit
            });
            if (res.success) {
                setMembers(res.data);
                setTotalMembers(res.total || 0);
                setTotalPages(res.pages || 1);
            }
        } catch (err) {
            console.error('Error fetching members directory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (mem) => {
        const name = mem.fullName?.gu || mem.fullName?.en || 'આ સભ્ય';
        const confirmDelete = window.confirm(`શું તમે ખરેખર સભ્ય "${name}" ને ડિલીટ કરવા માંગો છો?\nAre you sure you want to delete member "${name}"?`);
        if (!confirmDelete) return;

        try {
            await memberApi.delete(mem._id);
            fetchMembers();
        } catch (err) {
            alert(err.response?.message || err.message || 'સભ્ય ડિલીટ કરવામાં ભૂલ આવી.');
        }
    };

    // Fetch members on dependency changes or debounce search
    useEffect(() => {
        if (!village?._id) return;
        const timer = setTimeout(() => {
            fetchMembers();
        }, 200);

        return () => clearTimeout(timer);
    }, [
        village?._id,
        selectedAtak,
        selectedGender,
        isHeadOnly,
        occupationCategory,
        workCity,
        search,
        page,
        limit,
        refreshTrigger
    ]);

    const resetFilters = () => {
        setSearch('');
        setSelectedAtak('');
        setSelectedGender('');
        setIsHeadOnly(false);
        setOccupationCategory('');
        setWorkCity('');
        setPage(1);
    };

    return (
        <div className="animate-fade">
            {/* Top Bar with Title and Add Button */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                        ગામ સભ્યોની ડિરેક્ટરી / Members Directory ({village?.name?.gu} - {village?.name?.en})
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        કુલ {totalMembers} સભ્યો નોંધાયેલા છે (Total {totalMembers} community members in database)
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* View Switcher */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '4px',
                                background: viewMode === 'table' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                                color: viewMode === 'table' ? 'var(--accent-amber)' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}
                        >
                            <TableIcon size={14} /> ટેબલ
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '4px',
                                background: viewMode === 'grid' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                                color: viewMode === 'grid' ? 'var(--accent-amber)' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}
                        >
                            <LayoutGrid size={14} /> કાર્ડ્સ
                        </button>
                    </div>

                    {canManage && (
                        <button
                            onClick={() => onAddMember && onAddMember(village)}
                            className="btn btn-primary btn-sm"
                        >
                            <Plus size={15} /> નવો સભ્ય ઉમેરો (Add Member)
                        </button>
                    )}
                </div>
            </div>

            {/* Filter and Search Box */}
            <div className="glass-panel" style={{
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {/* Search input */}
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} color="var(--text-muted)" style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }} />
                    <input
                        type="text"
                        placeholder="નામ, અંગ્રેજી નામ, મોબાઈલ નંબર, સળંગ ક્રમ (#), વ્યવસાય કે ઘર નંબરથી શોધો..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="form-input"
                        style={{ paddingLeft: '38px', fontSize: '0.9rem' }}
                    />
                </div>

                {/* Filter selects row */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    alignItems: 'center'
                }}>
                    {/* Atak Filter */}
                    <div style={{ minWidth: '150px', flex: '1 1 auto' }}>
                        <select
                            value={selectedAtak}
                            onChange={(e) => {
                                setSelectedAtak(e.target.value);
                                setPage(1);
                            }}
                            className="form-select"
                        >
                            <option value="">તમામ અટક / All Ataks</option>
                            {village?.registeredAtaks?.map((a, i) => (
                                <option key={i} value={a.atak.gu}>
                                    {a.atak.gu} ({a.atak.en})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Gender Filter */}
                    <div style={{ minWidth: '130px', flex: '1 1 auto' }}>
                        <select
                            value={selectedGender}
                            onChange={(e) => {
                                setSelectedGender(e.target.value);
                                setPage(1);
                            }}
                            className="form-select"
                        >
                            <option value="">જાતિ / Gender (All)</option>
                            <option value="male">પુરુષ / Male</option>
                            <option value="female">સ્ત્રી / Female</option>
                        </select>
                    </div>

                    {/* Occupation Category */}
                    <div style={{ minWidth: '150px', flex: '1 1 auto' }}>
                        <select
                            value={occupationCategory}
                            onChange={(e) => {
                                setOccupationCategory(e.target.value);
                                setPage(1);
                            }}
                            className="form-select"
                        >
                            <option value="">વ્યવસાય / Category (All)</option>
                            <option value="agriculture">ખેતી / Agriculture</option>
                            <option value="business">વેપાર / Business</option>
                            <option value="private_job">પ્રાઇવેટ નોકરી / Private Job</option>
                            <option value="govt_job">સરકારી નોકરી / Govt Job</option>
                            <option value="homemaker">ઘરકામ / Homemaker</option>
                            <option value="student">વિદ્યાર્થી / Student</option>
                            <option value="retired">નિવૃત્ત / Retired</option>
                        </select>
                    </div>

                    {/* Head Only Checkbox */}
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        color: 'var(--text-secondary)',
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <input
                            type="checkbox"
                            checked={isHeadOnly}
                            onChange={(e) => {
                                setIsHeadOnly(e.target.checked);
                                setPage(1);
                            }}
                            style={{ accentColor: 'var(--accent-amber)' }}
                        />
                        <span>ફક્ત મુખ્ય સભ્યો (Heads only)</span>
                    </label>

                    {/* Reset Button */}
                    {(search || selectedAtak || selectedGender || isHeadOnly || occupationCategory || workCity) && (
                        <button
                            onClick={resetFilters}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem' }}
                        >
                            ફિલ્ટર સાફ કરો (Reset)
                        </button>
                    )}
                </div>
            </div>

            {/* Content: Table or Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    સભ્યોની યાદી લોડ થઈ રહી છે... (Loading members...)
                </div>
            ) : members.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        આ ફિલ્ટર્સ મુજબ કોઈ સભ્ય મળ્યો નથી. (No members found matching your search)
                    </p>
                    <button
                        onClick={resetFilters}
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '12px' }}
                    >
                        બધા સભ્યો જુઓ (View All)
                    </button>
                </div>
            ) : viewMode === 'table' ? (
                /* TABLE VIEW: Dual Render (Desktop Table + Mobile Cards) */
                <>
                    {/* Desktop Table View */}
                    <div className="glass-panel hide-mobile" style={{ overflowX: 'auto', marginBottom: '20px' }}>
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
                                    <th style={{ padding: '12px 14px' }}>સળંગ ક્રમ</th>
                                    <th style={{ padding: '12px 14px' }}>ઘર નં.</th>
                                    <th style={{ padding: '12px 14px' }}>અટક</th>
                                    <th style={{ padding: '12px 14px' }}>સભ્યનું નામ</th>
                                    <th style={{ padding: '12px 14px' }}>સંબંધ</th>
                                    <th style={{ padding: '12px 14px' }}>જાતિ / ઉંમર</th>
                                    <th style={{ padding: '12px 14px' }}>અભ્યાસ</th>
                                    <th style={{ padding: '12px 14px' }}>વ્યવસાય & શહેર</th>
                                    <th style={{ padding: '12px 14px' }}>મોબાઈલ</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>ક્રિયા</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((mem) => {
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
                                                {mem.serialNumber ? `#${mem.serialNumber}` : '-'}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                                                    {mem.houseNumber}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 14px', fontWeight: '600', color: '#FFF' }}>
                                                {mem.atak?.gu}
                                                {mem.atak?.en && (
                                                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                                                        {mem.atak.en}
                                                    </div>
                                                )}
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
                                            <td style={{ padding: '12px 14px' }}>
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
                                                {mem.mobileNumber ? (
                                                    <a href={`tel:${mem.mobileNumber}`} className="tel-link">
                                                        {mem.mobileNumber}
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                    <button
                                                        onClick={() => onSelectMember && onSelectMember(mem)}
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ fontSize: '0.725rem' }}
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
                    <div className="show-mobile" style={{ marginBottom: '20px' }}>
                        {members.map((mem) => {
                            const isMale = mem.gender?.key === 'male';
                            return (
                                <div key={mem._id} className="mobile-member-card">
                                    <div className="mobile-member-card-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: isMale ? 'rgba(59, 130, 246, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                                color: isMale ? '#60A5FA' : '#FB7185',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '700',
                                                fontSize: '0.9rem'
                                            }}>
                                                {mem.fullName?.gu ? mem.fullName.gu.charAt(0) : 'સ'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.95rem' }}>
                                                    {mem.fullName?.gu}
                                                    {mem.isFamilyHead && (
                                                        <span className="badge badge-amber" style={{ marginLeft: '6px', fontSize: '0.625rem' }}>
                                                            મુખ્ય
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {mem.fullName?.en || ''}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="badge badge-amber" style={{ fontSize: '0.725rem' }}>
                                            ઘર નં. {mem.houseNumber}
                                        </span>
                                    </div>

                                    <div className="mobile-member-card-body">
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                                                {mem.atak?.gu}
                                            </span>
                                            <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                                                {mem.relationWithHead?.gu || '-'}
                                            </span>
                                            <span className={`badge ${isMale ? 'badge-blue' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                                                {mem.gender?.gu} {mem.age ? `• ${mem.age} વ.` : ''}
                                            </span>
                                            {mem.serialNumber && (
                                                <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                                                    #{mem.serialNumber}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                                            {mem.education?.qualification && (
                                                <div>🎓 {mem.education.qualification}</div>
                                            )}
                                            {mem.occupation?.title && (
                                                <div>💼 {mem.occupation.title} {mem.occupation.workCity ? `(📍 ${mem.occupation.workCity})` : ''}</div>
                                            )}
                                            {mem.mobileNumber && (
                                                <div>
                                                    📞 <a href={`tel:${mem.mobileNumber}`} className="tel-link">
                                                        {mem.mobileNumber}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mobile-member-card-actions">
                                        <button
                                            onClick={() => onSelectMember && onSelectMember(mem)}
                                            className="btn btn-secondary btn-sm"
                                            style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
                                        >
                                            પ્રોફાઇલ જુઓ
                                        </button>
                                        {canManage && (
                                            <>
                                                <button
                                                    onClick={() => onEditMember && onEditMember(mem)}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '6px 10px' }}
                                                    title="Edit Member"
                                                >
                                                    <Edit size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMember(mem)}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '6px 10px', color: '#FB7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                                                    title="Delete Member"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                /* GRID CARDS VIEW */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '14px',
                    marginBottom: '20px'
                }}>
                    {members.map((mem) => {
                        const isMale = mem.gender?.key === 'male';
                        return (
                            <div
                                key={mem._id}
                                className="glass-panel"
                                style={{
                                    padding: '16px',
                                    border: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative'
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span className="badge badge-amber" style={{ fontSize: '0.725rem' }}>
                                            ઘર નં. {mem.houseNumber}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {mem.serialNumber ? `ક્રમ #${mem.serialNumber}` : ''}
                                        </span>
                                    </div>

                                    <div style={{ marginTop: '10px' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFF' }}>
                                            {mem.fullName?.gu}
                                        </div>
                                        {mem.fullName?.en && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {mem.fullName.en}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                                            અટક: {mem.atak?.gu}
                                        </span>
                                        <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                                            {mem.relationWithHead?.gu}
                                        </span>
                                        <span className={`badge ${isMale ? 'badge-blue' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                                            {mem.gender?.gu} • {mem.age} વ.
                                        </span>
                                    </div>

                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: '0.785rem',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        {mem.occupation?.title && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Briefcase size={13} color="var(--accent-amber)" />
                                                <span>{mem.occupation.title} {mem.occupation.workCity ? `(${mem.occupation.workCity})` : ''}</span>
                                            </div>
                                        )}
                                        {mem.education?.qualification && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <GraduationCap size={13} color="#60A5FA" />
                                                <span>અભ્યાસ: {mem.education.qualification}</span>
                                            </div>
                                        )}
                                        {mem.mobileNumber && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Phone size={13} color="#34D399" />
                                                <a href={`tel:${mem.mobileNumber}`} className="tel-link">
                                                    {mem.mobileNumber}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '14px',
                                    paddingTop: '10px',
                                    borderTop: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <button
                                        onClick={() => onSelectMember && onSelectMember(mem)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ fontSize: '0.75rem', flex: 1 }}
                                    >
                                        વિગત જુઓ (Profile)
                                    </button>
                                    {canManage && (
                                        <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                                            <button
                                                onClick={() => onEditMember && onEditMember(mem)}
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '6px 8px' }}
                                                title="Edit Member"
                                            >
                                                <Edit size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMember(mem)}
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '6px 8px', color: '#FB7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                                                title="Delete Member"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '12px 18px',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        <span>પ્રતિ પેજ:</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="form-select"
                            style={{ width: '70px', padding: '4px 8px' }}
                        >
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>(કુલ {totalMembers} સભ્યો)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="btn btn-secondary btn-sm"
                        >
                            <ChevronLeft size={14} /> પાછલું (Prev)
                        </button>

                        <span style={{ fontSize: '0.825rem', fontWeight: '600', color: '#FFF' }}>
                            પેજ {page} / {totalPages}
                        </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="btn btn-secondary btn-sm"
                        >
                            આગળનું (Next) <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
