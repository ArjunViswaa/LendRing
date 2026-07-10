import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'renter',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function updateField(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed, please try again');
        } finally {
            setSubmitting(false);
        }
    }

    const inputStyle =
        'rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-900';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-8 flex flex-col gap-4"
            >
                <h1 className="text-2xl font-semibold text-gray-900">Join Lend-Ring</h1>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Name
                    <input name="name" value={form.name} onChange={updateField} required className={inputStyle} />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Email
                    <input name="email" type="email" value={form.email} onChange={updateField} required className={inputStyle} />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Password
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={updateField}
                        minLength={8}
                        required
                        className={inputStyle}
                    />
                </label>

                <fieldset className="rounded-md border border-gray-200 p-3 flex flex-col gap-2 text-sm text-gray-700">
                    <legend className="px-1 text-gray-500">I mainly want to</legend>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="role"
                            value="renter"
                            checked={form.role === 'renter'}
                            onChange={updateField}
                        />
                        Rent items from others
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="role"
                            value="lender"
                            checked={form.role === 'lender'}
                            onChange={updateField}
                        />
                        Lend out my items
                    </label>
                </fieldset>

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-gray-900 py-2.5 text-white font-medium hover:bg-gray-700 disabled:opacity-60"
                >
                    {submitting ? 'Creating account...' : 'Sign up'}
                </button>

                <p className="text-sm text-center text-gray-600">
                    Already a member?{' '}
                    <Link to="/login" className="underline hover:text-gray-900">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default RegisterPage;