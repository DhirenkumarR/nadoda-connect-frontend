import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { memberApi, familyApi } from '../services/api';

export const RELATION_OPTIONS = [
    { gu: 'પોતે', en: 'Self' },
    { gu: 'પત્ની', en: 'Wife' },
    { gu: 'પતિ', en: 'Husband' },
    { gu: 'પુત્ર', en: 'Son' },
    { gu: 'પુત્રી', en: 'Daughter' },
    { gu: 'પુત્રવધુ', en: 'Daughter-in-law' },
    { gu: 'પૌત્ર', en: 'Grandson' },
    { gu: 'પૌત્રી', en: 'Granddaughter' },
    { gu: 'દાદા', en: 'Grandfather' },
    { gu: 'દાદી', en: 'Grandmother' },
    { gu: 'પિતા', en: 'Father' },
    { gu: 'માતા', en: 'Mother' },
    { gu: 'ભાઈ', en: 'Brother' },
    { gu: 'બહેન', en: 'Sister' },
    { gu: 'કાકા', en: 'Uncle' },
    { gu: 'કાકી', en: 'Aunt' },
    { gu: 'અન્ય', en: 'Other' }
];

const RELATION_EN_MAP = RELATION_OPTIONS.reduce((acc, curr) => {
    acc[curr.gu] = curr.en;
    return acc;
}, {});

export const MemberFormModal = ({
    village,
    family,
    memberToEdit,
    onClose,
    onSuccess
}) => {
    const isEdit = Boolean(memberToEdit);

    const [familiesList, setFamiliesList] = useState([]);
    const [selectedFamilyId, setSelectedFamilyId] = useState(
        memberToEdit?.familyId?._id || memberToEdit?.familyId || family?._id || ''
    );

    const [formData, setFormData] = useState({
        serialNumber: memberToEdit?.serialNumber || '',
        fullNameGu: memberToEdit?.fullName?.gu || '',
        fullNameEn: memberToEdit?.fullName?.en || '',
        relationGu: memberToEdit?.relationWithHead?.gu || 'પોતે',
        genderKey: memberToEdit?.gender?.key || 'male',
        age: memberToEdit?.age || '',
        qualification: memberToEdit?.education?.qualification || '',
        isStudying: memberToEdit?.education?.isStudying || false,
        maritalStatusKey: memberToEdit?.maritalStatus?.key || 'married',
        occupationTitle: memberToEdit?.occupation?.title || 'ખેતી',
        occupationCategory: memberToEdit?.occupation?.category || 'agriculture',
        workCity: memberToEdit?.occupation?.workCity || family?.address?.currentCity?.gu || village?.name?.gu || '',
        mobileNumber: memberToEdit?.mobileNumber || '',
        email: memberToEdit?.email || '',
        isFamilyHead: memberToEdit?.isFamilyHead || false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRelationChange = (newRelGu) => {
        const femaleRelations = ['પત્ની', 'પુત્રી', 'પુત્રવધુ', 'પૌત્રી', 'માતા', 'દાદી', 'બહેન', 'કાકી'];
        const maleRelations = ['પોતે', 'પતિ', 'પુત્ર', 'પૌત્ર', 'પિતા', 'દાદા', 'ભાઈ', 'કાકા'];

        let newGender = formData.genderKey;
        if (femaleRelations.includes(newRelGu)) {
            newGender = 'female';
        } else if (maleRelations.includes(newRelGu)) {
            newGender = 'male';
        }

        setFormData(prev => ({
            ...prev,
            relationGu: newRelGu,
            genderKey: newGender
        }));
    };

    // Fetch families if not provided
    useEffect(() => {
        if (!family && village?._id) {
            familyApi.getAll({ villageId: village._id, limit: 150 }).then((res) => {
                if (res.success) {
                    setFamiliesList(res.data);
                    if (!selectedFamilyId && res.data.length > 0) {
                        setSelectedFamilyId(res.data[0]._id);
                    }
                }
            });
        }
    }, [village?._id, family]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const targetFamId = selectedFamilyId || family?._id;
        if (!targetFamId) {
            setError('Please select or specify a family for this member');
            setLoading(false);
            return;
        }

        const maritalGuMap = {
            married: 'પરણિત',
            unmarried: 'અપરણિત',
            widow: 'વિધવા',
            widower: 'વિધુર',
            divorced: 'છૂટાછેડા'
        };

        const resolvedVillageId = village?._id || family?.villageId?._id || family?.villageId || memberToEdit?.villageId?._id || memberToEdit?.villageId;

        const payload = {
            villageId: resolvedVillageId,
            familyId: targetFamId,
            serialNumber: formData.serialNumber ? Number(formData.serialNumber) : undefined,
            fullName: { gu: formData.fullNameGu, en: formData.fullNameEn },
            relationWithHead: {
                gu: formData.relationGu,
                en: RELATION_EN_MAP[formData.relationGu] || memberToEdit?.relationWithHead?.en || formData.relationGu
            },
            gender: {
                key: formData.genderKey,
                gu: formData.genderKey === 'male' ? 'પુરુષ' : 'સ્ત્રી'
            },
            age: formData.age ? Number(formData.age) : undefined,
            education: {
                qualification: formData.qualification,
                isStudying: formData.isStudying
            },
            maritalStatus: {
                key: formData.maritalStatusKey,
                gu: maritalGuMap[formData.maritalStatusKey] || 'પરણિત'
            },
            occupation: {
                title: formData.occupationTitle,
                category: formData.occupationCategory,
                workCity: formData.workCity
            },
            mobileNumber: formData.mobileNumber,
            email: formData.email ? formData.email.toLowerCase().trim() : undefined,
            isFamilyHead: formData.isFamilyHead
        };

        try {
            let resData = null;
            if (isEdit) {
                const res = await memberApi.update(memberToEdit._id, payload);
                resData = res?.data;
            } else {
                const res = await memberApi.create(payload);
                resData = res?.data;
            }
            if (onSuccess) onSuccess(resData);
            onClose();
        } catch (err) {
            setError(err.response?.message || err.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ padding: '24px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserPlus size={22} color="var(--accent-amber)" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                            {isEdit ? 'સભ્ય વિગતો સુધારો (Edit Member)' : 'નવો સભ્ય ઉમેરો (Add New Member)'}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: '#FB7185',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.825rem',
                        marginBottom: '16px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Family selector */}
                    <div>
                        <label className="form-label">કુટુંબ પસંદ કરો (Family Selection)*</label>
                        {family ? (
                            <input
                                type="text"
                                disabled
                                value={`ઘર નં. ${family.houseNumber} - ${family.atak?.gu} (${family.headMemberId?.fullName?.gu || 'કુટુંબ'})`}
                                className="form-input"
                                style={{ opacity: 0.8 }}
                            />
                        ) : (
                            <select
                                required
                                value={selectedFamilyId}
                                onChange={(e) => setSelectedFamilyId(e.target.value)}
                                className="form-select"
                            >
                                <option value="">કુટુંબ પસંદ કરો...</option>
                                {familiesList.map((f) => (
                                    <option key={f._id} value={f._id}>
                                        ઘર નં. {f.houseNumber} - {f.atak?.gu} ({f.headMemberId?.fullName?.gu || f.primaryMobile || 'કુટુંબ'})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label className="form-label">સભ્યનું પૂરું નામ (ગુજરાતી)*</label>
                            <input
                                type="text"
                                required
                                value={formData.fullNameGu}
                                onChange={(e) => setFormData({ ...formData, fullNameGu: e.target.value })}
                                className="form-input"
                                placeholder="દા.ત. ચાવડા કાંતિભાઈ કરમણભાઈ"
                            />
                        </div>
                        <div>
                            <label className="form-label">Full Name (English)</label>
                            <input
                                type="text"
                                value={formData.fullNameEn}
                                onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                                className="form-input"
                                placeholder="e.g. Chavda Kantibhai Karmanbhai"
                            />
                        </div>
                    </div>

                    <div className="form-grid-3">
                        <div>
                            <label className="form-label">સંબંધ (Relation)*</label>
                            <select
                                value={formData.relationGu}
                                onChange={(e) => handleRelationChange(e.target.value)}
                                className="form-select"
                            >
                                {RELATION_OPTIONS.map((r) => (
                                    <option key={r.gu} value={r.gu}>
                                        {r.gu} ({r.en})
                                    </option>
                                ))}
                                {!RELATION_OPTIONS.some(r => r.gu === formData.relationGu) && formData.relationGu && (
                                    <option value={formData.relationGu}>
                                        {formData.relationGu}
                                    </option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="form-label">જાતિ (Gender)*</label>
                            <select
                                value={formData.genderKey}
                                onChange={(e) => setFormData({ ...formData, genderKey: e.target.value })}
                                className="form-select"
                            >
                                <option value="male">પુરુષ (Male)</option>
                                <option value="female">સ્ત્રી (Female)</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label">ઉંમર (Age)</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="form-input"
                                placeholder="દા.ત. 45"
                            />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label className="form-label">અભ્યાસ (Education)</label>
                            <input
                                type="text"
                                value={formData.qualification}
                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                className="form-input"
                                placeholder="10 / 12 / બી.એ. / ડિપ્લોમા"
                            />
                        </div>
                        <div>
                            <label className="form-label">લગ્ન સ્થિતિ (Marital Status)</label>
                            <select
                                value={formData.maritalStatusKey}
                                onChange={(e) => setFormData({ ...formData, maritalStatusKey: e.target.value })}
                                className="form-select"
                            >
                                <option value="married">પરણિત (Married)</option>
                                <option value="unmarried">અપરણિત (Unmarried)</option>
                                <option value="widow">વિધવા (Widow)</option>
                                <option value="widower">વિધુર (Widower)</option>
                                <option value="divorced">છૂટાછેડા (Divorced)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label className="form-label">વ્યવસાય (Occupation Title)</label>
                            <input
                                type="text"
                                value={formData.occupationTitle}
                                onChange={(e) => setFormData({ ...formData, occupationTitle: e.target.value })}
                                className="form-input"
                                placeholder="ખેતી / શિક્ષક / વેપાર"
                            />
                        </div>
                        <div>
                            <label className="form-label">કાર્યક્ષેત્ર / શહેર (Work City)</label>
                            <input
                                type="text"
                                value={formData.workCity}
                                onChange={(e) => setFormData({ ...formData, workCity: e.target.value })}
                                className="form-input"
                                placeholder={`${village?.name?.gu || 'ગામનું નામ'} / અમદાવાદ / સુરત`}
                            />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label className="form-label">મોબાઈલ નંબર (Mobile)</label>
                            <input
                                type="tel"
                                value={formData.mobileNumber}
                                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                className="form-input"
                                placeholder="98XXXXXXXX"
                            />
                        </div>
                        <div>
                            <label className="form-label">ઈમેલ (Email for Password Reset)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="form-input"
                                placeholder="member@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">સળંગ ક્રમ (Census Serial Number #)</label>
                        <input
                            type="number"
                            value={formData.serialNumber}
                            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                            className="form-input"
                            placeholder="દા.ત. 120"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.825rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.isFamilyHead}
                                onChange={(e) => setFormData({ ...formData, isFamilyHead: e.target.checked })}
                                style={{ accentColor: 'var(--accent-amber)' }}
                            />
                            <span>કુટુંબના મુખ્ય સભ્ય છે (Head of Family)</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.825rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.isStudying}
                                onChange={(e) => setFormData({ ...formData, isStudying: e.target.checked })}
                                style={{ accentColor: 'var(--accent-emerald)' }}
                            />
                            <span>અભ્યાસ ચાલુ છે (Currently Studying)</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            રદ કરો (Cancel)
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            <Save size={15} /> {loading ? 'સેવિંગ...' : 'સાચવો (Save Member)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
