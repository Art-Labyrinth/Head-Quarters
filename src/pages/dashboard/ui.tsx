import React, {useState} from 'react';
import {MainLayout} from "../../widgets/layouts/main";
import {useUserStore} from "../../entities/user";


import {UserRole} from "../../entities/user/types";
import {downloadQRCodes} from "../../entities/ticket/api.qr";

export const Dashboard: React.FC = () => {
    const {session} = useUserStore()

    // Debug form state
    const [prefix, setPrefix] = useState('GST');
    const [part, setPart] = useState(10);
    const [quantity, setQuantity] = useState(10);
    const [loading, setLoading] = useState(false);

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await downloadQRCodes({
                prefix,
                part,
                quantity,
            }, session?.access_token);
            if ('blob' in result && 'filename' in result) {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(result.blob);
                link.download = result.filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                throw result;
            }
        } catch (err) {
            console.error(err);
            alert('File download error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout header={'Dashboard'}>
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-2">Welcome Back, {session?.username}!</h1>
                <p className="text-stone-600">Here's what's happening with your dashboard today.</p>
            </div>

            {/* Debug QR Download Form (admin only) */}
            {session?.role === UserRole.admin && (
                <div className="mb-8 p-4 bg-stone-50 border border-stone-200 rounded-lg max-w-xl">
                    <h2 className="text-lg font-semibold mb-2">Debug: QR Code Generation</h2>
                    <form className="flex flex-col gap-3" onSubmit={handleDownload}>
                        <div className="flex gap-2 items-center">
                            <label className="w-24 font-medium">Prefix:</label>
                            <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="border rounded px-2 py-1 flex-1" required />
                        </div>
                        <div className="flex gap-2 items-center">
                            <label className="w-24 font-medium">Part:</label>
                            <input type="number" value={part} min={1} onChange={e => setPart(Number(e.target.value))} className="border rounded px-2 py-1 flex-1" required />
                        </div>
                        <div className="flex gap-2 items-center">
                            <label className="w-24 font-medium">Quantity:</label>
                            <input type="number" value={quantity} min={1} onChange={e => setQuantity(Number(e.target.value))} className="border rounded px-2 py-1 flex-1" required />
                        </div>
                        <button type="submit" className="mt-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-60" disabled={loading}>
                            {loading ? 'Downloading...' : 'Generate and Download'}
                        </button>
                    </form>
                </div>
            )}
        </MainLayout>
    )
};
