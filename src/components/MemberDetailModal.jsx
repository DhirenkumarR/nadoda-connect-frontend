import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Phone,
    Mail,
    MapPin,
    GraduationCap,
    Briefcase,
    Heart,
    Shield,
    Sparkles,
    Calendar,
    Droplets,
    Trash2,
    Edit,
    Home,
    Users,
    CheckCircle2,
    Clock,
    Crown,
    MessageCircle,
    Hash
} from 'lucide-react';
import { memberApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OCCUPATION_CATEGORY_MAP = {
    agriculture: { gu: 'ખેતી (Agriculture)', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
    business: { gu: 'વેપાર (Business)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
    private_job: { gu: 'ખાનગી નોકરી (Private Job)', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
    govt_job: { gu: 'સરકારી નોકરી (Govt Job)', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
    homemaker: { gu: 'ગૃહિણી (Homemaker)', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
    student: { gu: 'વિદ્યાર્થી (Student)', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
    retired: { gu: 'નિવૃત્ત (Retired)', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' },
    labour: { gu: 'મજૂરી / શ્રમ (Labour)', color: '#F97316', bg: 'rgba(249, 115, 22, 0.12)' },
    professional: { gu: 'પ્રોફેશનલ (Professional)', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' },
    other: { gu: 'અન્ય (Other)', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' }
};

export const MemberDetailModal = ({
    member,
    village,
    onClose,
    onDeleted,
    onEdit,
    onGoToFamily
}) => {
    const { user, canManageVillage } = useAuth();
    const [fullMember, setFullMember] = useState(member);
    const [loadingFull, setLoadingFull] = useState(false);

    useEffect(() => {
        setFullMember(member);
        if (member?._id) {
            setLoadingFull(true);
            memberApi.getById(member._id)
                .then(res => {
                    if (res && res.success && res.data) {
                        setFullMember(res.data);
                    }
                })
                .catch(err => {
                    console.error('Error fetching full member details:', err);
                })
                .finally(() => {
                    setLoadingFull(false);
                });
        }
    }, [member]);

    if (!member) return null;

    const mem = fullMember || member;
    const isMale = mem.gender?.key === 'male';
    const villageId = mem.villageId?._id || mem.villageId || village?._id;
    const familyId = mem.familyId?._id || mem.familyId;
    const canManage = (villageId && canManageVillage(villageId)) || (user?.familyId && String(user.familyId) === String(familyId));

    // Administrative & Village Data
    const villageData = mem.villageId && typeof mem.villageId === 'object' ? mem.villageId : village;
    const villageNameGu = villageData?.name?.gu || 'બાસ્પા';
    const villageNameEn = villageData?.name?.en || 'Baspa';
    const talukaGu = villageData?.taluka?.gu || 'સમી';
    const talukaEn = villageData?.taluka?.en || 'Sami';
    const districtGu = villageData?.district?.gu || 'પાટણ';
    const districtEn = villageData?.district?.en || 'Patan';
    const stateGu = villageData?.state?.gu || 'ગુજરાત';
    const pincode = villageData?.pincode || '384245';

    // Surname and Kuldevi Resolution
    const atakGu = mem.atak?.gu || '';
    const atakEn = mem.atak?.en || '';
    const familyObj = mem.familyId && typeof mem.familyId === 'object' ? mem.familyId : null;
    const familyKuldeviGu = familyObj?.kuldevi?.gu;
    const familyKuldeviEn = familyObj?.kuldevi?.en;
    const registeredAtaks = villageData?.registeredAtaks || [];
    const matchedAtak = registeredAtaks.find(
        (a) => a.atak?.gu === atakGu || (atakEn && a.atak?.en?.toLowerCase() === atakEn.toLowerCase())
    );
    const resolvedKuldeviGu = familyKuldeviGu || matchedAtak?.kuldevi?.gu || '';
    const resolvedKuldeviEn = familyKuldeviEn || matchedAtak?.kuldevi?.en || '';

    // Address Details
    const nativeVillageGu = familyObj?.address?.nativeVillage?.gu || villageNameGu;
    const nativeVillageEn = familyObj?.address?.nativeVillage?.en || villageNameEn;
    const currentCityGu = familyObj?.address?.currentCity?.gu || villageNameGu;
    const currentCityEn = familyObj?.address?.currentCity?.en || villageNameEn;
    const streetAddress = familyObj?.address?.streetAddress || '';

    // Contact Details
    const cleanMobile = mem.mobileNumber ? mem.mobileNumber.replace(/\D/g, '') : '';
    const formattedMobile = mem.mobileNumber || '';
    const familyMobile = familyObj?.primaryMobile || '';
    const cleanFamilyMobile = familyMobile ? familyMobile.replace(/\D/g, '') : '';

    // Occupation styling
    const occCategoryInfo = OCCUPATION_CATEGORY_MAP[mem.occupation?.category] || OCCUPATION_CATEGORY_MAP.other;

    // Date formatting helper
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? null : d.toLocaleDateString('gu-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return null;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100, backdropFilter: 'blur(6px)' }}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    padding: '24px 28px',
                    maxWidth: '680px',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)'
                }}
            >
                {/* Modal Header & Avatar */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '18px',
                            background: isMale
                                ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                                : 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFF',
                            fontSize: '1.75rem',
                            fontWeight: '800',
                            boxShadow: isMale
                                ? '0 8px 20px rgba(59, 130, 246, 0.35)'
                                : '0 8px 20px rgba(244, 63, 94, 0.35)',
                            flexShrink: 0,
                            position: 'relative'
                        }}>
                            {mem.fullName?.gu ? mem.fullName.gu.charAt(0) : <User size={30} />}
                            {mem.isFamilyHead && (
                                <div
                                    title="મુખ્ય સભ્ય (Family Head)"
                                    style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                        color: '#FFF',
                                        borderRadius: '50%',
                                        width: '22px',
                                        height: '22px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid #0F172A',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                                    }}
                                >
                                    <Crown size={12} />
                                </div>
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#FFF', letterSpacing: '-0.02em', margin: 0 }}>
                                    {mem.fullName?.gu}
                                </h3>
                                {mem.isFamilyHead && (
                                    <span className="badge badge-amber" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Crown size={11} /> મુખ્ય સભ્ય (Head)
                                    </span>
                                )}
                                {mem.isAlive === false && (
                                    <span className="badge badge-slate" style={{ fontSize: '0.7rem', background: 'rgba(100, 116, 139, 0.3)' }}>
                                        સ્વર્ગસ્થ (Deceased)
                                    </span>
                                )}
                            </div>

                            {mem.fullName?.en && (
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: '500' }}>
                                    {mem.fullName.en}
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', marginTop: '4px' }}>
                                <span style={{ color: 'var(--accent-amber)', fontWeight: '600' }}>
                                    અટક: {atakGu} {atakEn && `(${atakEn})`}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>•</span>
                                <span style={{ color: '#FFF', fontWeight: '600' }}>
                                    ઘર નં. {mem.houseNumber}
                                </span>
                                {mem.serialNumber && (
                                    <>
                                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            સળંગ ક્રમ #{mem.serialNumber}
                                        </span>
                                    </>
                                )}
                                {mem.memberOrder && (
                                    <>
                                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            અ.નં. #{mem.memberOrder}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="બંધ કરો (Close)"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Primary Badges Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                    <span className={`badge ${isMale ? 'badge-blue' : 'badge-rose'}`} style={{ fontWeight: '600' }}>
                        {mem.gender?.gu} ({isMale ? 'Male' : 'Female'})
                    </span>

                    <span className="badge badge-slate" style={{ fontWeight: '600' }}>
                        ઉંમર: {mem.age !== undefined && mem.age !== null ? `${mem.age} વર્ષ` : 'અજાણ'}
                    </span>

                    <span className="badge badge-slate" style={{ fontWeight: '600' }}>
                        સંબંધ: {mem.relationWithHead?.gu || 'પોતે'} {mem.relationWithHead?.en && `(${mem.relationWithHead.en})`}
                    </span>

                    <span className="badge badge-emerald" style={{ fontWeight: '600' }}>
                        લગ્ન સ્થિતિ: {mem.maritalStatus?.gu || 'પરણિત'}
                    </span>

                    {mem.bloodGroup && (
                        <span className="badge badge-rose" style={{ fontWeight: '600' }}>
                            <Droplets size={12} /> રક્ત જૂથ: {mem.bloodGroup}
                        </span>
                    )}

                    {resolvedKuldeviGu && (
                        <span className="badge badge-amber" style={{ fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} /> કુળદેવી: {resolvedKuldeviGu}
                        </span>
                    )}
                </div>

                {/* Information Sections Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Section 1: શિક્ષણ અને વ્યવસાય (Education & Occupation) */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.28)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        padding: '14px 18px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Briefcase size={16} color="var(--accent-amber)" />
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#FFF', margin: 0 }}>
                                શિક્ષણ અને વ્યવસાય (Education & Occupation)
                            </h4>
                        </div>

                        <div className="form-grid-2" style={{ gap: '12px', fontSize: '0.85rem' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    અભ્યાસ (Education):
                                </span>
                                <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{mem.education?.qualification || '-'}</span>
                                    {mem.education?.isStudying ? (
                                        <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                            અભ્યાસ ચાલુ
                                        </span>
                                    ) : (
                                        mem.education?.qualification && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                (પૂર્ણ)
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    વ્યવસાય / કામ (Occupation):
                                </span>
                                <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px' }}>
                                    {mem.occupation?.title || 'ખેતી / અન્ય'}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    વ્યવસાય શ્રેણી (Category):
                                </span>
                                <div style={{ marginTop: '3px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: occCategoryInfo.color,
                                        background: occCategoryInfo.bg,
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        border: `1px solid ${occCategoryInfo.color}33`
                                    }}>
                                        {occCategoryInfo.gu}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    કાર્યક્ષેત્ર / શહેર (Work City):
                                </span>
                                <div style={{ fontWeight: '600', color: 'var(--accent-amber)', marginTop: '2px' }}>
                                    📍 {mem.occupation?.workCity || villageNameGu}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: સંપર્ક માહિતી (Contact Information) */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.28)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        padding: '14px 18px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Phone size={16} color="#34D399" />
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#FFF', margin: 0 }}>
                                સંપર્ક વિગતો (Contact Information)
                            </h4>
                        </div>

                        <div className="form-grid-2" style={{ gap: '12px', fontSize: '0.85rem' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    સભ્યનો મોબાઈલ (Mobile Number):
                                </span>
                                {formattedMobile ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                                        <a
                                            href={`tel:${formattedMobile}`}
                                            style={{
                                                fontWeight: '700',
                                                color: '#34D399',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            📞 {formattedMobile}
                                        </a>
                                        {cleanMobile.length >= 10 && (
                                            <a
                                                href={`https://wa.me/91${cleanMobile.slice(-10)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    color: '#22C55E',
                                                    borderColor: 'rgba(34, 197, 94, 0.3)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                                title="WhatsApp પર મેસેજ કરો"
                                            >
                                                <MessageCircle size={12} />
                                                <span>WhatsApp</span>
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>-</div>
                                )}
                            </div>

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    ઈમેલ (Email):
                                </span>
                                {mem.email ? (
                                    <div style={{ marginTop: '3px' }}>
                                        <a
                                            href={`mailto:${mem.email}`}
                                            style={{
                                                fontWeight: '600',
                                                color: '#60A5FA',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                wordBreak: 'break-all'
                                            }}
                                        >
                                            ✉️ {mem.email}
                                        </a>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>-</div>
                                )}
                            </div>

                            {familyMobile && familyMobile !== formattedMobile && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                        કુટુંબનો મુખ્ય મોબાઈલ (Family Primary Phone):
                                    </span>
                                    <div style={{ marginTop: '3px' }}>
                                        <a
                                            href={`tel:${familyMobile}`}
                                            style={{
                                                fontWeight: '600',
                                                color: '#A7F3D0',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            📞 {familyMobile} (કુટુંબ હેડલાઇન)
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: કુટુંબ અને મૂળ વિગત (Family & Kuldevi) */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.28)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        padding: '14px 18px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Home size={16} color="var(--accent-amber)" />
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#FFF', margin: 0 }}>
                                    કુટુંબ અને વંશ વિગત (Family & Heritage)
                                </h4>
                            </div>

                            {onGoToFamily && familyId && (
                                <button
                                    onClick={() => {
                                        onGoToFamily(familyId);
                                        onClose();
                                    }}
                                    className="btn btn-secondary btn-sm"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.75rem',
                                        padding: '4px 10px',
                                        color: 'var(--accent-amber)',
                                        borderColor: 'rgba(245, 158, 11, 0.4)'
                                    }}
                                    title="આ કુટુંબના તમામ સભ્યોની યાદી જુઓ"
                                >
                                    <Home size={13} />
                                    <span>કુટુંબ જુઓ (Go to Family)</span>
                                </button>
                            )}
                        </div>

                        <div className="form-grid-2" style={{ gap: '12px', fontSize: '0.85rem' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    ઘર નંબર (House No.):
                                </span>
                                <div style={{ fontWeight: '700', color: '#FFF', marginTop: '2px' }}>
                                    #{mem.houseNumber}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    કુળદેવી (Kuldevi):
                                </span>
                                <div style={{ fontWeight: '700', color: 'var(--accent-amber)', marginTop: '2px' }}>
                                    {resolvedKuldeviGu ? `શ્રી ${resolvedKuldeviGu}` : 'શ્રી આશાપુરા માતાજી'}
                                    {resolvedKuldeviEn && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>({resolvedKuldeviEn})</span>}
                                </div>
                            </div>

                            {familyObj?.totalMembersCount && (
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                        કુટુંબના કુલ સભ્યો (Family Members):
                                    </span>
                                    <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px' }}>
                                        {familyObj.totalMembersCount} સભ્યો
                                    </div>
                                </div>
                            )}

                            {familyObj?.serialNumberRange?.start && (
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                        કુટુંબ સળંગ ક્રમાંક (Serial Range):
                                    </span>
                                    <div style={{ fontWeight: '600', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        #{familyObj.serialNumberRange.start} થી #{familyObj.serialNumberRange.end}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 4: સરનામું અને ગામ (Address & Location) */}
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.28)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        padding: '14px 18px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <MapPin size={16} color="#60A5FA" />
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#FFF', margin: 0 }}>
                                ગામ અને સરનામું (Village & Address)
                            </h4>
                        </div>

                        <div className="form-grid-2" style={{ gap: '12px', fontSize: '0.85rem' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    ગામ (Village):
                                </span>
                                <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px' }}>
                                    {villageNameGu} {villageNameEn && `(${villageNameEn})`}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    તાલુકો અને જિલ્લો (Taluka / District):
                                </span>
                                <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px' }}>
                                    તા. {talukaGu}, જિ. {districtGu}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    મૂળ ગામ (Native Village):
                                </span>
                                <div style={{ fontWeight: '600', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {nativeVillageGu} {nativeVillageEn && `(${nativeVillageEn})`}
                                </div>
                            </div>

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    હાલનું શહેર / સ્થળ (Current City):
                                </span>
                                <div style={{ fontWeight: '600', color: 'var(--accent-amber)', marginTop: '2px' }}>
                                    📍 {currentCityGu} {currentCityEn && `(${currentCityEn})`}
                                </div>
                            </div>

                            {streetAddress && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                        શેરી / રહેઠાણ સરનામું (Street Address):
                                    </span>
                                    <div style={{ fontWeight: '500', color: '#FFF', marginTop: '2px' }}>
                                        {streetAddress}
                                    </div>
                                </div>
                            )}

                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                    રાજ્ય અને પિનકોડ (State & PIN):
                                </span>
                                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {stateGu} - {pincode}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: મેટ્રિમોનિયલ પ્રોફાઇલ (Matrimonial Profile - if unmarried & data present) */}
                    {(mem.matrimonialProfile?.isRegistered || (mem.maritalStatus?.key === 'unmarried' && (mem.matrimonialProfile?.birthDate || mem.matrimonialProfile?.height || mem.matrimonialProfile?.partnerExpectations))) && (
                        <div style={{
                            background: 'rgba(236, 72, 153, 0.08)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(236, 72, 153, 0.25)',
                            padding: '14px 18px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Heart size={16} color="#F43F5E" />
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#FDA4AF', margin: 0 }}>
                                    લગ્ન વિષયક વિગત (Matrimonial Profile)
                                </h4>
                            </div>

                            <div className="form-grid-2" style={{ gap: '12px', fontSize: '0.85rem' }}>
                                {mem.matrimonialProfile?.birthDate && (
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                            જન્મ તારીખ (Birth Date):
                                        </span>
                                        <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px' }}>
                                            📅 {formatDate(mem.matrimonialProfile.birthDate)}
                                        </div>
                                    </div>
                                )}

                                {mem.matrimonialProfile?.height && (
                                    <div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                            ઊંચાઈ (Height):
                                        </span>
                                        <div style={{ fontWeight: '600', color: '#FFF', marginTop: '2px' }}>
                                            {mem.matrimonialProfile.height}
                                        </div>
                                    </div>
                                )}

                                {mem.matrimonialProfile?.hobbies && mem.matrimonialProfile.hobbies.length > 0 && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                            શોખ (Hobbies):
                                        </span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                            {mem.matrimonialProfile.hobbies.map((h, idx) => (
                                                <span key={idx} className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {mem.matrimonialProfile?.partnerExpectations && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                                            અપેક્ષા (Partner Expectations):
                                        </span>
                                        <div style={{ color: '#FFF', marginTop: '2px', fontStyle: 'italic' }}>
                                            "{mem.matrimonialProfile.partnerExpectations}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section 6: સિસ્ટમ અને નોંધણી મેટા (Record Metadata) */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={13} color="#10B981" />
                            <span>સ્થિતિ:</span>
                            <span style={{ color: '#10B981', fontWeight: '600' }}>
                                {mem.verificationStatus === 'pending' ? 'ચકાસણી બાકી (Pending)' : 'ચકાસાયેલ (Verified & Approved)'}
                            </span>
                        </div>

                        {mem.updatedAt && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} />
                                <span>છેલ્લો સુધારો: {formatDate(mem.updatedAt)}</span>
                            </div>
                        )}
                    </div>

                </div>

                {/* Actions Footer */}
                <div style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: canManage ? 'space-between' : 'flex-end',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    {canManage && (
                        <button
                            onClick={async () => {
                                const name = mem.fullName?.gu || mem.fullName?.en || 'આ સભ્ય';
                                const confirmDelete = window.confirm(`શું તમે ખરેખર સભ્ય "${name}" ને ડિલીટ કરવા માંગો છો?\nAre you sure you want to delete member "${name}"?`);
                                if (!confirmDelete) return;

                                try {
                                    await memberApi.delete(mem._id);
                                    if (onDeleted) onDeleted(mem);
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
                        {onGoToFamily && familyId && (
                            <button
                                onClick={() => {
                                    onGoToFamily(familyId);
                                    onClose();
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: 'var(--accent-amber)',
                                    borderColor: 'rgba(245, 158, 11, 0.4)'
                                }}
                                title="આ કુટુંબના તમામ સભ્યો જુઓ"
                            >
                                <Home size={14} />
                                <span>કુટુંબ (Family)</span>
                            </button>
                        )}

                        {canManage && onEdit && (
                            <button
                                onClick={() => {
                                    if (onClose) onClose();
                                    onEdit(mem);
                                }}
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
