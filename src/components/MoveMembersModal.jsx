import React, { useState, useEffect } from 'react';
import {
    X,
    Users,
    ArrowRight,
    Home,
    Building2,
    CheckCircle2,
    AlertCircle,
    UserPlus,
    Shuffle
} from 'lucide-react';
import { familyApi } from '../services/api';

export const MoveMembersModal = ({
    isOpen,
    onClose,
    sourceFamily,
    initialSelectedMemberIds = [],
    village,
    onSuccess
}) => {
    if (!isOpen || !sourceFamily) return null;

    const [selectedMemberIds, setSelectedMemberIds] = useState(initialSelectedMemberIds);
    const [destinationType, setDestinationType] = useState('new'); // 'new' or 'existing'

    // Existing family target
    const [existingFamilies, setExistingFamilies] = useState([]);
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [targetFamilyId, setTargetFamilyId] = useState('');

    // New family target fields
    const [newHouseNumber, setNewHouseNumber] = useState('');
    const [newAtakGu, setNewAtakGu] = useState(sourceFamily.atak?.gu || '');
    const [newAtakEn, setNewAtakEn] = useState(sourceFamily.atak?.en || '');
    const [newKuldeviGu, setNewKuldeviGu] = useState(sourceFamily.kuldevi?.gu || '');
    const [newKuldeviEn, setNewKuldeviEn] = useState(sourceFamily.kuldevi?.en || '');
    const [newCityGu, setNewCityGu] = useState(sourceFamily.address?.currentCity?.gu || 'બાસ્પા');
    const [newCityEn, setNewCityEn] = useState(sourceFamily.address?.currentCity?.en || 'Baspa');
    const [newStreetAddress, setNewStreetAddress] = useState(sourceFamily.address?.streetAddress || '');
    const [newPrimaryMobile, setNewPrimaryMobile] = useState('');
    const [newHeadMemberId, setNewHeadMemberId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Load available families in village for the existing dropdown
    useEffect(() => {
        if (!village?._id) return;
        const loadFamilies = async () => {
            setLoadingExisting(true);
            try {
                const res = await familyApi.getAll({
                    villageId: village._id,
                    limit: 200
                });
                if (res.success) {
                    // Filter out the source family
                    const filtered = res.data.filter(f => f._id !== sourceFamily._id);
                    setExistingFamilies(filtered);
                    if (filtered.length > 0) {
                        setTargetFamilyId(filtered[0]._id);
                    }
                }
            } catch (err) {
                console.error('Failed to load families:', err);
            } finally {
                setLoadingExisting(false);
            }
        };

        loadFamilies();
    }, [village?._id, sourceFamily?._id]);

    // Preselect members if passed
    useEffect(() => {
        if (initialSelectedMemberIds && initialSelectedMemberIds.length > 0) {
            setSelectedMemberIds(initialSelectedMemberIds);
            setNewHeadMemberId(initialSelectedMemberIds[0]);
        }
    }, [initialSelectedMemberIds]);

    const handleToggleMember = (memId) => {
        setError('');
        if (selectedMemberIds.includes(memId)) {
            const next = selectedMemberIds.filter(id => id !== memId);
            setSelectedMemberIds(next);
            if (newHeadMemberId === memId) {
                setNewHeadMemberId(next[0] || '');
            }
        } else {
            const next = [...selectedMemberIds, memId];
            setSelectedMemberIds(next);
            if (!newHeadMemberId) {
                setNewHeadMemberId(memId);
            }
        }
    };

    const handleSelectAll = () => {
        const allIds = (sourceFamily.members || []).map(m => m._id);
        setSelectedMemberIds(allIds);
        if (allIds.length > 0) setNewHeadMemberId(allIds[0]);
    };

    const handleDeselectAll = () => {
        setSelectedMemberIds([]);
        setNewHeadMemberId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (selectedMemberIds.length === 0) {
            setError('કૃપા કરીને ઓછામાં ઓછો ૧ સભ્ય પસંદ કરો જેને ખસેડવો છે. (Please select at least 1 member)');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                sourceFamilyId: sourceFamily._id,
                memberIds: selectedMemberIds,
                destinationType
            };

            if (destinationType === 'existing') {
                if (!targetFamilyId) {
                    setError('કૃપા કરીને લક્ષ્ય કુટુંબ પસંદ કરો (Please select target family)');
                    setLoading(false);
                    return;
                }
                payload.targetFamilyId = targetFamilyId;
            } else {
                payload.newFamilyData = {
                    houseNumber: newHouseNumber ? Number(newHouseNumber) : undefined,
                    atak: { gu: newAtakGu, en: newAtakEn },
                    kuldevi: { gu: newKuldeviGu, en: newKuldeviEn },
                    address: {
                        nativeVillage: sourceFamily.address?.nativeVillage || { gu: 'બાસ્પા', en: 'Baspa' },
                        currentCity: { gu: newCityGu, en: newCityEn },
                        streetAddress: newStreetAddress
                    },
                    primaryMobile: newPrimaryMobile,
                    newHeadMemberId: newHeadMemberId || selectedMemberIds[0]
                };
            }

            const res = await familyApi.moveMembers(payload);
            if (res.success) {
                setSuccessMsg(res.message || 'સભ્યોને સફળતાપૂર્વક ખસેડવામાં આવ્યા છે!');
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                }, 1200);
            }
        } catch (err) {
            console.error('Error moving members:', err);
            setError(err.response?.message || err.message || 'સભ્યો ખસેડવામાં ભૂલ આવી.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '720px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'rgba(19, 30, 54, 0.98)',
                border: '1px solid var(--border-hover)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px',
                position: 'relative',
                boxShadow: 'var(--shadow-xl)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '16px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--accent-amber)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Shuffle size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                                સભ્યો ખસેડો / નવું કુટુંબ બનાવો (Move Members)
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                સ્રોત: ઘર નં. {sourceFamily.houseNumber} - {sourceFamily.atak?.gu} ({sourceFamily.headMemberId?.fullName?.gu || 'મુખ્ય સભ્ય'})
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Error / Success message */}
                {error && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.35)',
                        color: '#FB7185',
                        fontSize: '0.825rem',
                        marginBottom: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={16} />
                        <div>{error}</div>
                    </div>
                )}

                {successMsg && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#34D399',
                        fontSize: '0.825rem',
                        marginBottom: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <CheckCircle2 size={16} />
                        <div>{successMsg}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Step 1: Member Selection */}
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px'
                        }}>
                            <label className="form-label" style={{ marginBottom: 0, fontWeight: '700' }}>
                                ૧. ખસેડવા માટે સભ્યો પસંદ કરો (Select Members to Move)
                            </label>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    style={{ color: 'var(--accent-amber)', background: 'transparent' }}
                                >
                                    બધા પસંદ કરો
                                </button>
                                <span>•</span>
                                <button
                                    type="button"
                                    onClick={handleDeselectAll}
                                    style={{ color: 'var(--text-muted)', background: 'transparent' }}
                                >
                                    રદ કરો
                                </button>
                            </div>
                        </div>

                        <div style={{
                            maxHeight: '180px',
                            overflowY: 'auto',
                            background: 'rgba(0, 0, 0, 0.25)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            padding: '10px'
                        }}>
                            {(sourceFamily.members || []).map((mem) => {
                                const isChecked = selectedMemberIds.includes(mem._id);
                                return (
                                    <label
                                        key={mem._id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 10px',
                                            borderRadius: '6px',
                                            background: isChecked ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggleMember(mem._id)}
                                                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-amber)' }}
                                            />
                                            <div>
                                                <span style={{ fontWeight: '600', color: '#FFF', fontSize: '0.85rem' }}>
                                                    {mem.fullName?.gu}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                                    ({mem.relationWithHead?.gu || 'સભ્ય'} • {mem.age ? `${mem.age} વ.` : ''})
                                                </span>
                                            </div>
                                        </div>
                                        <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                                            #{mem.serialNumber || mem.memberOrder || '-'}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '6px' }}>
                            પસંદ કરેલ: {selectedMemberIds.length} સભ્યો
                        </div>
                    </div>

                    {/* Step 2: Destination Choice */}
                    <div>
                        <label className="form-label" style={{ fontWeight: '700', marginBottom: '8px' }}>
                            ૨. ખસેડવાનો પ્રકાર પસંદ કરો (Destination Option)
                        </label>
                        <div className="form-grid-2" style={{ gap: '12px' }}>
                            <label style={{
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                border: `1.5px solid ${destinationType === 'new' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                                background: destinationType === 'new' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <input
                                    type="radio"
                                    name="destinationType"
                                    value="new"
                                    checked={destinationType === 'new'}
                                    onChange={() => setDestinationType('new')}
                                    style={{ accentColor: 'var(--accent-amber)' }}
                                />
                                <div>
                                    <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.9rem' }}>
                                        ✨ નવું કુટુંબ બનાવો
                                    </div>
                                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                                        Create New Separate Family
                                    </div>
                                </div>
                            </label>

                            <label style={{
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                border: `1.5px solid ${destinationType === 'existing' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                                background: destinationType === 'existing' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <input
                                    type="radio"
                                    name="destinationType"
                                    value="existing"
                                    checked={destinationType === 'existing'}
                                    onChange={() => setDestinationType('existing')}
                                    style={{ accentColor: 'var(--accent-amber)' }}
                                />
                                <div>
                                    <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.9rem' }}>
                                        🏛️ પ્રવર્તમાન કુટુંબમાં ખસેડો
                                    </div>
                                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                                        Merge into Existing Family
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Step 3: Specific Configuration based on choice */}
                    {destinationType === 'new' ? (
                        <div style={{
                            padding: '16px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-amber)' }}>
                                નવા કુટુંબની વિગતો (New Family Details):
                            </div>

                            <div className="form-grid-2" style={{ gap: '12px' }}>
                                <div>
                                    <label className="form-label">
                                        ઘર નંબર (House No - ખાલી રાખશો તો આપમેળે નવો ક્રમ બનશે)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="દા.ત. 172"
                                        value={newHouseNumber}
                                        onChange={(e) => setNewHouseNumber(e.target.value)}
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">નવા મુખ્ય સભ્ય (New Head of Household)</label>
                                    <select
                                        value={newHeadMemberId}
                                        onChange={(e) => setNewHeadMemberId(e.target.value)}
                                        className="form-select"
                                    >
                                        {selectedMemberIds.map(id => {
                                            const m = (sourceFamily.members || []).find(x => x._id === id);
                                            return (
                                                <option key={id} value={id}>
                                                    {m?.fullName?.gu || id}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="form-grid-2" style={{ gap: '12px' }}>
                                <div>
                                    <label className="form-label">અટક (ગુજરાતી)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAtakGu}
                                        onChange={(e) => setNewAtakGu(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Surname (English)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAtakEn}
                                        onChange={(e) => setNewAtakEn(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2" style={{ gap: '12px' }}>
                                <div>
                                    <label className="form-label">કુળદેવી માતાજી (ગુજરાતી)</label>
                                    <input
                                        type="text"
                                        value={newKuldeviGu}
                                        onChange={(e) => setNewKuldeviGu(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">હાલનું શહેર (City)</label>
                                    <input
                                        type="text"
                                        value={newCityGu}
                                        onChange={(e) => {
                                            setNewCityGu(e.target.value);
                                            setNewCityEn(e.target.value);
                                        }}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">પ્રાથમિક સંપર્ક મોબાઈલ</label>
                                <input
                                    type="text"
                                    placeholder="દા.ત. 9824406691"
                                    value={newPrimaryMobile}
                                    onChange={(e) => setNewPrimaryMobile(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            padding: '16px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            <label className="form-label" style={{ fontWeight: '600' }}>
                                લક્ષ્ય કુટુંબ પસંદ કરો (Select Target Destination Family)
                            </label>
                            {loadingExisting ? (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    કુટુંબો લોડ થઈ રહ્યા છે...
                                </div>
                            ) : (
                                <select
                                    value={targetFamilyId}
                                    onChange={(e) => setTargetFamilyId(e.target.value)}
                                    className="form-select"
                                >
                                    {existingFamilies.map((f) => (
                                        <option key={f._id} value={f._id}>
                                            ઘર નં. {f.houseNumber} - {f.atak?.gu} ({f.headMemberId?.fullName?.gu || 'મુખ્ય'}) - {f.totalMembersCount || 0} સભ્યો
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '16px'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            રદ કરો (Cancel)
                        </button>

                        <button
                            type="submit"
                            disabled={loading || selectedMemberIds.length === 0}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {loading ? (
                                'ખસેડી રહ્યા છીએ...'
                            ) : (
                                <>
                                    <span>પુષ્ટિ કરો અને ખસેડો (Confirm & Move)</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
