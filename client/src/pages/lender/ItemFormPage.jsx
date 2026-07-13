import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    fetchMyItems,
    createItem,
    updateItem,
    uploadItemPhotos,
    removeItemPhoto,
} from '../../api/items';
import { rupeesToPaise, paiseToRupees } from '../../utils/money';

const CATEGORIES = ['electronics', 'tools', 'outdoor', 'events', 'sports', 'other'];

const inputStyle = 'rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-900';

function ItemFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'electronics',
        ratePerDay: '',
        depositAmount: '',
    });
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchMyItems().then((items) => {
            const item = items.find((i) => i._id === id);
            if (!item) {
                navigate('/dashboard/listings');
                return;
            }
            setForm({
                title: item.title,
                description: item.description,
                category: item.category,
                ratePerDay: paiseToRupees(item.ratePerDay),
                depositAmount: paiseToRupees(item.depositAmount),
            });
            setExistingPhotos(item.photos);
        });
    }, [id, navigate]);

    function updateField(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function removeExistingPhoto(url) {
        const updated = await removeItemPhoto(id, url);
        setExistingPhotos(updated.photos);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaving(true);

        const payload = {
            ...form,
            ratePerDay: rupeesToPaise(form.ratePerDay),
            depositAmount: rupeesToPaise(form.depositAmount),
        };

        try {
            const item = id ? await updateItem(id, payload) : await createItem(payload);
            if (newFiles.length > 0) {
                await uploadItemPhotos(item._id, newFiles);
            }
            navigate('/dashboard/listings');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save the listing');
            setSaving(false);
        }
    }

    return (
        <div className="max-w-lg">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {id ? 'Edit listing' : 'Add an item'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
                {error && <p className="text-sm text-red-600">{error}</p>}

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Title
                    <input name="title" value={form.title} onChange={updateField} required className={inputStyle} />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Description
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={updateField}
                        required
                        rows={4}
                        className={inputStyle}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Category
                    <select name="category" value={form.category} onChange={updateField} className={inputStyle}>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1 text-sm text-gray-700">
                        Rate per day (₹)
                        <input
                            name="ratePerDay"
                            type="number"
                            min="1"
                            step="1"
                            value={form.ratePerDay}
                            onChange={updateField}
                            required
                            className={inputStyle}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-gray-700">
                        Security deposit (₹)
                        <input
                            name="depositAmount"
                            type="number"
                            min="0"
                            step="1"
                            value={form.depositAmount}
                            onChange={updateField}
                            required
                            className={inputStyle}
                        />
                    </label>
                </div>

                {existingPhotos.length > 0 && (
                    <div className="flex flex-col gap-2 text-sm text-gray-700">
                        Current photos
                        <div className="flex gap-2 flex-wrap">
                            {existingPhotos.map((url) => (
                                <div key={url} className="relative">
                                    <img src={url} alt="" className="h-20 w-20 object-cover rounded-md border border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingPhoto(url)}
                                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-5 h-5 text-xs leading-none hover:bg-red-50"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    {id ? 'Add more photos' : 'Photos (up to 5)'}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setNewFiles(Array.from(e.target.files))}
                        className="text-sm"
                    />
                </label>

                <button
                    type="submit"
                    disabled={saving}
                    className="self-start rounded-md bg-gray-900 px-4 py-2 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-60"
                >
                    {saving ? 'Saving...' : id ? 'Save changes' : 'Create listing'}
                </button>
            </form>
        </div>
    );
}

export default ItemFormPage;