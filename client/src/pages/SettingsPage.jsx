import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { updateProfile, changePassword } from '../api/users';

const inputStyle =
    'rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-900';

function SettingsPage() {
    const { user, updateStoredUser } = useAuth();

    const [profile, setProfile] = useState({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
        pincode: user.pincode || '',
    });
    const [profileMsg, setProfileMsg] = useState(null);

    const [passwords, setPasswords] = useState({ current: '', next: '' });
    const [passwordMsg, setPasswordMsg] = useState(null);

    async function saveProfile(e) {
        e.preventDefault();
        setProfileMsg(null);
        try {
            const updated = await updateProfile(profile);
            updateStoredUser({ ...user, ...updated });
            setProfileMsg({ ok: true, text: 'Profile saved' });
        } catch (err) {
            setProfileMsg({ ok: false, text: err.response?.data?.message || 'Could not save profile' });
        }
    }

    async function savePassword(e) {
        e.preventDefault();
        setPasswordMsg(null);
        try {
            await changePassword(passwords.current, passwords.next);
            setPasswords({ current: '', next: '' });
            setPasswordMsg({ ok: true, text: 'Password updated' });
        } catch (err) {
            setPasswordMsg({ ok: false, text: err.response?.data?.message || 'Could not update password' });
        }
    }

    return (
        <div className="max-w-lg flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
            </div>

            <form onSubmit={saveProfile} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
                <h2 className="text-lg font-medium text-gray-900">Profile</h2>

                {profileMsg && (
                    <p className={`text-sm ${profileMsg.ok ? 'text-green-700' : 'text-red-600'}`}>
                        {profileMsg.text}
                    </p>
                )}

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Name
                    <input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                        className={inputStyle}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Phone
                    <input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className={inputStyle}
                    />
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1 text-sm text-gray-700">
                        City
                        <input
                            value={profile.city}
                            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                            className={inputStyle}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-gray-700">
                        Pincode
                        <input
                            value={profile.pincode}
                            onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                            className={inputStyle}
                        />
                    </label>
                </div>

                <button className="self-start rounded-md bg-gray-900 px-4 py-2 text-white text-sm font-medium hover:bg-gray-700">
                    Save profile
                </button>
            </form>

            <form onSubmit={savePassword} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
                <h2 className="text-lg font-medium text-gray-900">Change password</h2>

                {passwordMsg && (
                    <p className={`text-sm ${passwordMsg.ok ? 'text-green-700' : 'text-red-600'}`}>
                        {passwordMsg.text}
                    </p>
                )}

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Current password
                    <input
                        type="password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        required
                        className={inputStyle}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    New password
                    <input
                        type="password"
                        value={passwords.next}
                        onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                        minLength={8}
                        required
                        className={inputStyle}
                    />
                </label>

                <button className="self-start rounded-md bg-gray-900 px-4 py-2 text-white text-sm font-medium hover:bg-gray-700">
                    Update password
                </button>
            </form>
        </div>
    );
}

export default SettingsPage;