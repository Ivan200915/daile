import React, { useState } from 'react';
import { Icons } from './Icons';
import { syncService } from '../services/syncService';
import { triggerHaptic } from '../services/hapticService';

interface AuthScreenProps {
    onSuccess: () => void;
    onClose: () => void;
}

export const AuthScreen = ({ onSuccess, onClose }: AuthScreenProps) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        triggerHaptic('light');

        try {
            const result = mode === 'login'
                ? await syncService.login(email, password)
                : await syncService.register(email, password);

            if (result.error) {
                setError(result.error);
                triggerHaptic('error');
            } else {
                triggerHaptic('success');
                onSuccess();
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDevLogin = async () => {
        setLoading(true);
        // Generated valid token for ID 123456789
        const MOCK_INIT_DATA = "auth_date=1769412590&query_id=AAE5GgUAAAAAAwuK7uA&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Ivan%22%2C%22last_name%22%3A%22Dev%22%2C%22username%22%3A%22ivandev%22%2C%22language_code%22%3A%22en%22%7D&hash=cd31b5579399c91eeaf62b75daad063a77644d84aeb4da9d3c722300c88db032";

        const result = await syncService.loginTelegram(MOCK_INIT_DATA);
        if (result.token) {
            triggerHaptic('success');
            onSuccess();
        } else {
            setError(result.error || 'Failed');
            triggerHaptic('error');
        }
        setLoading(false);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white"
                >
                    <Icons.X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-center mb-6">Authentication</h2>

                <div className="space-y-4">
                    <p className="text-center text-white/60 text-sm">
                        Open this app in Telegram to log in automatically.
                    </p>

                    <div className="border-t border-white/10 my-4"></div>

                    <button
                        onClick={handleDevLogin}
                        disabled={loading}
                        className="w-full bg-blue-500/20 text-blue-400 font-bold py-3 rounded-xl hover:bg-blue-500/30 transition flex items-center justify-center space-x-2"
                    >
                        <Icons.Lock size={18} />
                        <span>{loading ? 'Authenticating...' : 'Dev Login (Mock Telegram)'}</span>
                    </button>

                    {error && (
                        <div className="text-red-500 text-xs text-center mt-2">{error}</div>
                    )}
                </div>
            </div>
        </div>
    );
};
