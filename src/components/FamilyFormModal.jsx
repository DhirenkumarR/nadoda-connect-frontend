import React, { useState } from 'react';
import { X, Home, Save } from 'lucide-react';
import { familyApi } from '../services/api';

export const FamilyFormModal = ({
    village,
    initialAtak,
    familyToEdit,
    onClose,
    onSuccess
}) => {
    const isEdit = Boolean(familyToEdit);

    const [formData, setFormData] = useState({
        houseNumber: familyToEdit?.houseNumber || '',
        atakGu: familyToEdit?.atak?.gu || initialAtak?.atak?.gu || 'ચાવડા',
        atakEn: familyToEdit?.atak?.en || initialAtak?.atak?.en || 'Chavda',
        kuldeviGu: familyToEdit?.kuldevi?.gu || initialAtak?.kuldevi?.gu || 'શ્રી આશાપુરા માતાજી',
        kuldeviEn: familyToEdit?.kuldevi?.en || initialAtak?.kuldevi?.en || 'Shree Ashapura Mataji',
        primaryMobile: familyToEdit?.primaryMobile || '',
        currentCity: familyToEdit?.address?.currentCity?.gu || village?.name?.gu || '',
        streetAddress: familyToEdit?.address?.streetAddress || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const resolvedVillageId = village?._id || familyToEdit?.villageId?._id || familyToEdit?.villageId;
        const vGu = village?.name?.gu || familyToEdit?.address?.nativeVillage?.gu || '';
        const vEn = village?.name?.en || familyToEdit?.address?.nativeVillage?.en || '';
        const finalCity = formData.currentCity || vGu;

        const payload = {
            villageId: resolvedVillageId,
            houseNumber: Number(formData.houseNumber),
            atak: { gu: formData.atakGu, en: formData.atakEn },
            kuldevi: { gu: formData.kuldeviGu, en: formData.kuldeviEn },
            primaryMobile: formData.primaryMobile,
            address: {
                nativeVillage: {
                    gu: vGu,
                    en: vEn
                },
                currentCity: { gu: finalCity, en: finalCity },
                streetAddress: formData.streetAddress
            }
        };

        try {
            let resData = null;
            if (isEdit) {
                const res = await familyApi.update(familyToEdit._id, payload);
                resData = res?.data;
            } else {
                const res = await familyApi.create(payload);
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
                        <Home size={22} color="var(--accent-amber)" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFF' }}>
                            {isEdit ? 'કુટુંબ વિગતો સુધારો (Edit Family)' : 'નવું કુટુંબ ઉમેરો (Add New Family)'}
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
                    <div className="form-grid-2">
                        <div>
                            <label className="form-label">ગામ (Village)</label>
                            <input
                                type="text"
                                disabled
                                value={`${village?.name?.gu || 'બાસ્પા'} (${village?.name?.en || 'Baspa'})`}
                                className="form-input"
                                style={{ opacity: 0.7 }}
                            />
                        </div>

                        <div>
                            <label className="form-label">ઘર નંબર (House Number)*</label>
                            <input
                                type="number"
                                required
                                value={formData.houseNumber}
                                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                                className="form-input"
                                placeholder="દા.ત. 101"
                            />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label className="form-label">અટક (ગુજરાતી)*</label>
                            <input
                                type="text"
                                required
                                value={formData.atakGu}
                                onChange={(e) => setFormData({ ...formData, atakGu: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">Atak (English)*</label>
                            <input
                                type="text"
                                required
                                value={formData.atakEn}
                                onChange={(e) => setFormData({ ...formData, atakEn: e.target.value })}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label className="form-label">કુળદેવી માતાજી (ગુજરાતી)</label>
                            <input
                                type="text"
                                value={formData.kuldeviGu}
                                onChange={(e) => setFormData({ ...formData, kuldeviGu: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">Kuldevi (English)</label>
                            <input
                                type="text"
                                value={formData.kuldeviEn}
                                onChange={(e) => setFormData({ ...formData, kuldeviEn: e.target.value })}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div>
                            <label className="form-label">પ્રાથમિક મોબાઈલ નંબર</label>
                            <input
                                type="tel"
                                value={formData.primaryMobile}
                                onChange={(e) => setFormData({ ...formData, primaryMobile: e.target.value })}
                                className="form-input"
                                placeholder="98244XXXXX"
                            />
                        </div>
                        <div>
                            <label className="form-label">હાલનું શહેર (Current City)</label>
                            <input
                                type="text"
                                value={formData.currentCity}
                                onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                                className="form-input"
                                placeholder={`${village?.name?.gu || 'ગામનું નામ'} / અમદાવાદ / સુરત`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">શેરી / વિસ્તારનું સરનામું (Street Address)</label>
                        <input
                            type="text"
                            value={formData.streetAddress}
                            onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                            className="form-input"
                            placeholder="મોટો વાસ, રામજી મંદિર પાસે..."
                        />
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
                            <Save size={15} /> {loading ? 'સેવિંગ...' : 'સાચવો (Save Family)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
