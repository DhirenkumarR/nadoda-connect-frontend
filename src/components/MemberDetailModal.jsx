import React from 'react';
import {
    X,
    User,
    Phone,
    MapPin,
    GraduationCap,
    Briefcase,
    Heart,
    Shield,
    Sparkles,
    Calendar,
    Droplets,
    Trash2,
    Edit
} from 'lucide-react';
import { memberApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MemberDetailModal = ({ member, onClose, onDeleted, onEdit }) => {
    const { user, canManageVillage } = useAuth();
    if (!member) return null;

    const isMale = member.gender?.key === 'male';
    const villageId = member.villageId?._id || member.villageId;
    const familyId = member.familyId?._id || member.familyId;
    const canManage = (villageId && canManageVillage(villageId)) || (user?.familyId && String(user.familyId) === String(familyId));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ padding: '28px', maxWidth: '620px' }}
            >
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: isMale
                                ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                                : 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFF',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            {member.fullName?.gu ? member.fullName.gu.charAt(0) : <User size={28} />}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFF' }}>
                                    {member.fullName?.gu}
                                </h3>
                                {member.isFamilyHead && (
                                    <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                                        મુખ્ય સભ્ય (Head)
                                    </span>
                                )}
                            </div>
                            {member.fullName?.en && (
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {member.fullName.en}
                                </div>
                            )}
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '2px' }}>
                                અટક: {member.atak?.gu} ({member.atak?.en}) • ઘર નં. {member.houseNumber}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            padding: '6px',
                            borderRadius: '8px',
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Key Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    <span className={`badge ${isMale ? 'badge-blue' : 'badge-rose'}`}>
                        {member.gender?.gu} ({member.gender?.key})
                    </span>
                    <span className="badge badge-slate">
                        ઉંમર: {member.age ? `${member.age} વર્ષ` : 'અજાણ'}
                    </span>
                    <span className="badge badge-slate">
                        સંબંધ: {member.relationWithHead?.gu || 'પોતે'}
                    </span>
                    <span className="badge badge-emerald">
                        લગ્ન સ્થિતિ: {member.maritalStatus?.gu || 'પરણિત'}
                    </span>
                    {member.bloodGroup && (
                        <span className="badge badge-rose">
                            <Droplets size={12} /> રક્ત જૂથ: {member.bloodGroup}
                        </span>
                    )}
                    {member.serialNumber && (
                        <span className="badge badge-amber">
                            સળંગ ક્રમ #{member.serialNumber}
                        </span>
                    )}
                </div>

                {/* Detailed Information Grid */}
                <div className="form-grid-2" style={{
                    gap: '14px',
                    fontSize: '0.85rem',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                            વ્યવસાય (Occupation):
                        </span>
                        <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px' }}>
                            {member.occupation?.title || 'ખેતી / અન્ય'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            શ્રેણી: {member.occupation?.category || 'General'}
                        </div>
                    </div>

                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                            કાર્યક્ષેત્ર / શહેર (Work City):
                        </span>
                        <div style={{ fontWeight: '600', color: 'var(--accent-amber)', marginTop: '2px' }}>
                            📍 {member.occupation?.workCity || 'બાસ્પા'}
                        </div>
                    </div>

                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                            અભ્યાસ (Education):
                        </span>
                        <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px' }}>
                            {member.education?.qualification || '-'}
                            {member.education?.isStudying && (
                                <span className="badge badge-emerald" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                                    અભ્યાસ ચાલુ
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                            મોબાઈલ નંબર (Mobile):
                        </span>
                        <div style={{ fontWeight: '700', color: '#34D399', marginTop: '2px' }}>
                            {member.mobileNumber ? (
                                <a href={`tel:${member.mobileNumber}`} style={{ color: '#34D399' }}>
                                    📞 {member.mobileNumber}
                                </a>
                            ) : (
                                '-'
                            )}
                        </div>
                    </div>
                </div>

                {/* Family & Village Info */}
                <div style={{
                    marginTop: '16px',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.825rem'
                }}>
                    <div style={{ fontWeight: '600', color: '#FFF', marginBottom: '6px' }}>
                        કુટુંબ અને સરનામું (Family Details):
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                        ઘર નંબર: <strong>{member.houseNumber}</strong> • ગામ: <strong>{member.villageId?.name?.gu || 'બાસ્પા'}</strong>
                    </div>
                    {member.familyId?.address && (
                        <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                            હાલનું શહેર: {member.familyId.address.currentCity?.gu || 'બાસ્પા'} • મૂળ ગામ: {member.familyId.address.nativeVillage?.gu || 'બાસ્પા'}
                        </div>
                    )}
                </div>

                {/* Actions Footer */}
                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: canManage ? 'space-between' : 'flex-end',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    {canManage && (
                        <button
                            onClick={async () => {
                                const name = member.fullName?.gu || member.fullName?.en || 'આ સભ્ય';
                                const confirmDelete = window.confirm(`શું તમે ખરેખર સભ્ય "${name}" ને ડિલીટ કરવા માંગો છો?\nAre you sure you want to delete member "${name}"?`);
                                if (!confirmDelete) return;

                                try {
                                    await memberApi.delete(member._id);
                                    if (onDeleted) onDeleted(member);
                                    onClose();
                                } catch (err) {
                                    alert(err.response?.message || err.message || 'સભ્ય ડિલીટ કરવામાં ભૂલ આવી.');
                                }
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#FB7185', borderColor: 'rgba(244, 63, 94, 0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Trash2 size={14} />
                            <span>સભ્ય ડિલીટ કરો (Delete)</span>
                        </button>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {canManage && onEdit && (
                            <button
                                onClick={() => onEdit(member)}
                                className="btn btn-primary btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Edit size={14} />
                                <span>સંપાદિત કરો (Edit)</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="btn btn-secondary btn-sm"
                        >
                            બંધ કરો (Close)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
