import React, { useState, useEffect } from 'react';
import {
    Home,
    Users,
    MapPin,
    Phone,
    Mail,
    Plus,
    Edit,
    CheckCircle2,
    AlertCircle,
    User,
    Sparkles,
    Shield,
    RefreshCw,
    Trash2
} from 'lucide-react';
import { familyApi, memberApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MyFamilyView = ({
    onSelectMember,
    onEditFamily,
    onAddMember,
    onEditMember,
    village,
    refreshTrigger = 0
}) => {
    const { user } = useAuth();
    const [family, setFamily] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [localRefresh, setLocalRefresh] = useState(0);

    // Profile Email Update state
    const [emailInput, setEmailInput] = useState(user?.email || '');
    const [updatingEmail, setUpdatingEmail] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState('');

    const fetchMyFamily = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await familyApi.getMyFamily();
            if (res.success) {
                setFamily(res.data);
            }
        } catch (err) {
            console.error('Error fetching my family:', err);
            setError(err.response?.message || 'તમારા એકાઉન્ટ સાથે કુટુંબ જોડાયેલ મળ્યું નથી.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (mem) => {
        const name = mem.fullName?.gu || mem.fullName?.en || 'આ સભ્ય';
        const confirmDelete = window.confirm(`શું તમે ખરેખર તમારા પરિવારના સભ્ય "${name}" ને ડિલીટ કરવા માંગો છો?\nAre you sure you want to delete member "${name}"?`);
        if (!confirmDelete) return;

        try {
            await memberApi.delete(mem._id);
            setLocalRefresh(t => t + 1);
        } catch (err) {
            alert(err.response?.message || err.message || 'સભ્ય ડિલીટ કરવામાં ભૂલ આવી.');
        }
    };

    useEffect(() => {
        fetchMyFamily();
    }, [refreshTrigger, localRefresh]);

    // Handle update email
    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setUpdatingEmail(true);
        setEmailSuccess('');
        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('nadoda_token')}`
                },
                body: JSON.stringify({ email: emailInput })
            });
            const data = await res.json();
            if (data.success) {
                setEmailSuccess('તમારું ઈમેલ સફળતાપૂર્વક અપડેટ થઈ ગયું છે!');
                // Update local storage
                const curr = JSON.parse(localStorage.getItem('nadoda_user') || '{}');
                curr.email = emailInput;
                localStorage.setItem('nadoda_user', JSON.stringify(curr));
                setTimeout(() => setEmailSuccess(''), 4000);
            } else {
                setError(data.message || 'ઈમેલ અપડેટ કરવામાં ભૂલ આવી.');
            }
        } catch (err) {
            setError('ઈમેલ અપડેટ કરવામાં ભૂલ આવી.');
        } finally {
            setUpdatingEmail(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>
                <RefreshCw size={28} className="spin-icon" style={{ margin: '0 auto 12px' }} />
                <div>તમારા કુટુંબની માહિતી લોડ થઈ રહી છે... (Loading your family profile)</div>
            </div>
        );
    }

    if (error || !family) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '600px', margin: '40px auto' }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    color: '#FB7185',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                }}>
                    <Home size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF', marginBottom: '8px' }}>
                    કુટુંબ લિંક થયેલ નથી
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    {error || 'તમારા મોબાઈલ નંબર સાથે હજુ સુધી કોઈ કુટુંબ ડિરેક્ટરીમાં જોડાયેલ નથી. ગામના એડમિન દ્વારા તમારા કુટુંબની નોંધણી થયા પછી તમે અહીં સંપૂર્ણ વિગતો જોઈ અને સુધારી શકશો.'}
                </p>
                <div style={{ marginTop: '24px' }}>
                    <button onClick={() => setRefreshTrigger(t => t + 1)} className="btn btn-secondary">
                        <RefreshCw size={14} /> ફરી પ્રયાસ કરો (Retry)
                    </button>
                </div>
            </div>
        );
    }

    const members = family.members || [];

    return (
        <div className="animate-fade">
            {/* Top Banner: Family Overview */}
            <div className="glass-panel" style={{
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid var(--border-hover)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '180px',
                    height: '180px',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }}></div>

                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                            color: '#0F172A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '1.5rem',
                            boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)'
                        }}>
                            ઘર
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFF' }}>
                                    ઘર નંબર {family.houseNumber} - {family.atak?.gu} પરિવાર
                                </h2>
                                <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>
                                    {family.atak?.en}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                ગામ: <strong>{family.villageId?.name?.gu || 'બાસ્પા'}</strong> ({family.villageId?.taluka?.gu || 'રાધનપુર'}, {family.villageId?.district?.gu || 'પાટણ'})
                                {family.kuldevi?.gu && ` • કુળદેવી માતાજી: ${family.kuldevi.gu}`}
                            </p>
                        </div>
                    </div>

                    {/* Member Family Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => onEditFamily && onEditFamily(family)}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Edit size={16} />
                            <span>કુટુંબ વિગત સુધારો (Edit Family)</span>
                        </button>

                        <button
                            onClick={() => onAddMember && onAddMember(village || family.villageId, family)}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={16} />
                            <span>પરિવારમાં સભ્ય ઉમેરો (Add Member)</span>
                        </button>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '14px',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                }}>
                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>મુખ્ય વ્યક્તિ (Head of Family):</span>
                        <div style={{ fontWeight: '700', color: '#FFF', fontSize: '1.05rem', marginTop: '2px' }}>
                            {family.headMemberId?.fullName?.gu || '-'}
                        </div>
                        {family.headMemberId?.fullName?.en && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {family.headMemberId.fullName.en}
                            </div>
                        )}
                    </div>

                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>હાલનું રહેઠાણ (Current Address):</span>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="var(--accent-amber)" />
                            <span>{family.address?.currentCity?.gu || 'બાસ્પા'}</span>
                        </div>
                        {family.address?.streetAddress && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {family.address.streetAddress}
                            </div>
                        )}
                    </div>

                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>સંપર્ક મોબાઈલ નંબર:</span>
                        <div style={{ fontWeight: '600', color: '#34D399', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} />
                            <span>{family.primaryMobile || family.headMemberId?.mobileNumber || '-'}</span>
                        </div>
                    </div>

                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>કુલ પરિવાર સભ્યો:</span>
                        <div style={{ fontWeight: '800', color: 'var(--accent-amber)', fontSize: '1.25rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} />
                            <span>{members.length} સભ્યો</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email & Security Settings Card */}
            <div className="glass-panel" style={{
                padding: '18px 24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60A5FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Mail size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', color: '#FFF', fontSize: '0.95rem' }}>
                            તમારું નોંધાયેલ ઈમેલ (Registered Email for OTP & Password Reset)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            પાસવર્ડ ભૂલી ગયા હો ત્યારે વેરિફિકેશન કોડ આ ઈમેલ પર મોકલવામાં આવે છે.
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdateEmail} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                        type="email"
                        required
                        placeholder="તમારું ઈમેલ દાખલ કરો"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="form-input"
                        style={{ width: '260px', padding: '8px 12px' }}
                    />
                    <button
                        type="submit"
                        disabled={updatingEmail}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '8px 14px' }}
                    >
                        {updatingEmail ? 'સેવિંગ...' : 'ઈમેલ અપડેટ કરો'}
                    </button>
                    {emailSuccess && (
                        <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: '600' }}>
                            ✓ {emailSuccess}
                        </span>
                    )}
                </form>
            </div>

            {/* Members List Section */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                        પરિવારના સભ્યોની યાદી (Family Members Roster)
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        તમે કોઈપણ સભ્યની વિગતો સુધારી શકો છો અથવા નવો સભ્ય ઉમેરી શકો છો.
                    </p>
                </div>
                <button
                    onClick={() => onAddMember && onAddMember(village || family.villageId, family)}
                    className="btn btn-primary btn-sm"
                >
                    <Plus size={14} /> નવો સભ્ય ઉમેરો
                </button>
            </div>

            {members.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>કુટુંબમાં કોઈ સભ્ય નોંધાયેલ નથી.</p>
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
                                    <th style={{ padding: '12px 14px' }}>ક્રમ</th>
                                    <th style={{ padding: '12px 14px' }}>સભ્યનું નામ</th>
                                    <th style={{ padding: '12px 14px' }}>સંબંધ</th>
                                    <th style={{ padding: '12px 14px' }}>જાતિ / ઉંમર</th>
                                    <th style={{ padding: '12px 14px' }}>અભ્યાસ</th>
                                    <th style={{ padding: '12px 14px' }}>લગ્ન સ્થિતિ</th>
                                    <th style={{ padding: '12px 14px' }}>વ્યવસાય & શહેર</th>
                                    <th style={{ padding: '12px 14px' }}>મોબાઈલ</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>ક્રિયા</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((mem, idx) => {
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
                                                {mem.memberOrder || idx + 1}
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
                                            </td>
                                            <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                                                {mem.maritalStatus?.gu || '-'}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ color: 'var(--text-primary)' }}>
                                                    {mem.occupation?.title || mem.occupation?.category || '-'}
                                                </div>
                                                {mem.occupation?.workCity && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                                                        📍 {mem.occupation.workCity}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 14px', color: '#34D399' }}>
                                                {mem.mobileNumber || '-'}
                                            </td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button
                                                        onClick={() => onSelectMember && onSelectMember(mem)}
                                                        className="btn btn-secondary btn-sm"
                                                        title="View Full Profile"
                                                    >
                                                        વિગત
                                                    </button>
                                                    <button
                                                        onClick={() => onEditMember && onEditMember(mem)}
                                                        className="btn btn-primary btn-sm"
                                                        title="Edit Member Information"
                                                    >
                                                        <Edit size={13} /> સુધારો
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMember(mem)}
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ color: '#FB7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                                                        title="Remove Member from Family"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
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
                        {members.map((mem) => {
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
                                            <span>{mem.occupation?.title || mem.occupation?.category || '-'}</span>
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
                                            વિગત જુઓ
                                        </button>
                                        <button
                                            onClick={() => onEditMember && onEditMember(mem)}
                                            className="btn btn-primary btn-sm"
                                            style={{ flex: 1, padding: '7px 10px' }}
                                        >
                                            <Edit size={13} /> સુધારો
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMember(mem)}
                                            className="btn btn-secondary btn-sm"
                                            style={{ padding: '7px 12px', color: '#FB7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
