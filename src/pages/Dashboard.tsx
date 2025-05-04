import React, { useEffect, useState } from 'react';
import { API_URL_PREFIX } from '../config';

interface DataItem {
    profession: string;
    event_dates: string | null;
    department: string;
    quantity: number | null;
    country: string | null;
    time: string | null;
    form_type: string;
    phone: string;
    duration: string | null;
    id: number;
    email: string | null;
    lang: string | null;
    name: string;
    program_direction: string | null;
    raider: string | null;
    age: number;
    program_description: string | null;
    social: string | null;
    program_example: string | null;
    created_at: string;
}

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [volunteers, setVolunteers] = useState<DataItem[]>([]);
    const [masters, setMasters] = useState<DataItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${API_URL_PREFIX}form/get_forms`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json();

                setVolunteers(result.filter((item: DataItem) => item.form_type === 'volunteer'));
                setMasters(result.filter((item: DataItem) => item.form_type === 'master'));
            } catch (err) {
                setError(err as string);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="p-8 text-orange-200">
            {volunteers.length > 0 && (
                <>
                    <h1 className="text-2xl font-bold mb-4">Volunteers</h1>

                    <div className="flex flex-col gap-4">

                        <div className='flex flex-wrap gap-4 border-b'>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Name</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Age</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Social</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Tg</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Profession</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Department</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Created At</div>
                        </div>

                        {volunteers.map((item) => (
                            <React.Fragment key={item.id}>
                                <div className='flex flex-wrap gap-4 border-b '>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.name}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.age}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.social}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.email}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.profession || '-'}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.department}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{new Date(item.created_at).toLocaleString()}</div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
            {masters.length > 0 && (
                <>
                    <h1 className="text-2xl font-bold mb-4">Volunteers</h1>

                    <div className="flex flex-col gap-4">

                        <div className='flex flex-wrap gap-4 border-b'>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Name</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Age</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Social</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Tg</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Profession</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Department</div>
                            <div className="hidden sm:block font-bold p-2 w-full sm:w-auto">Created At</div>
                        </div>

                        {volunteers.map((item) => (
                            <React.Fragment key={item.id}>
                                <div className='flex flex-wrap gap-4 border-b '>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.name}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.age}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.social}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.email}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.profession || '-'}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{item.department}</div>
                                    <div className="p-2 border-b border-gray-300 w-full sm:w-auto flex-grow">{new Date(item.created_at).toLocaleString()}</div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;