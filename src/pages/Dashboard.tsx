import React, { useEffect, useState } from 'react';
import { API_URL_PREFIX } from '../config';
import Cell from '../components/Cell';

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
                    <h1 className="text-2xl font-bold my-4">Volunteers</h1>

                    <div className="flex flex-col gap-4">

                        <div className='flex flex-wrap gap-4 border sm:border-0'>
                            <Cell children="Name" />
                            <Cell children="Age" />
                            <Cell children="Social" />
                            <Cell children="Tg" />
                            <Cell children="Profession" />
                            <Cell children="Department" />
                            <Cell children="Created At" />
                        </div>

                        {volunteers.map((item) => (
                            <React.Fragment key={item.id}>
                                <div className='flex flex-wrap gap-4 p-2 border sm:border-0'>
                                    <Cell children={item?.name} />
                                    <Cell children={item?.age} />
                                    <Cell children={item?.social} />
                                    <Cell children={item?.phone} />
                                    <Cell children={item?.profession || '-'} />
                                    <Cell children={item?.department} />
                                    <Cell children={new Date(item.created_at).toLocaleString()} />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
            {masters.length > 0 && (
                <>
                    <h1 className="text-2xl font-bold my-4">Masters</h1>

                    <div className="flex flex-col gap-4">

                        <div className='flex flex-wrap gap-4 border sm:border-0'>
                            <Cell children="Name" />
                            <Cell children="Country" />
                            <Cell children="Tg" />
                            <Cell children="Email" />
                            <Cell children="Direction" />
                            <Cell children="Description" />
                            <Cell children="Date" />
                            <Cell children="Program URL" />
                            <Cell children="Social URL" />
                            <Cell children="Quantity" />
                            <Cell children="Time" />
                            <Cell children="Duration" />
                            <Cell children="Lang" />
                            <Cell children="Raider" />
                            <Cell children="Created At" />
                        </div>

                        {masters.map((item) => (
                            <React.Fragment key={item.id}>
                                <div className='flex flex-wrap gap-4 p-2 border sm:border-0'>
                                    <Cell children={item?.name} />
                                    <Cell children={item?.country} />
                                    <Cell children={item?.phone} />
                                    <Cell children={item?.email} />
                                    <Cell children={item?.program_direction} />
                                    <Cell children={item?.program_description} />
                                    <Cell children={item?.event_dates} />
                                    <Cell children={item?.program_example} />
                                    <Cell children={item?.social} />
                                    <Cell children={item?.quantity} />
                                    <Cell children={item?.time} />
                                    <Cell children={item?.duration} />
                                    <Cell children={item?.lang} />
                                    <Cell children={item?.raider} />


                                    <Cell children={new Date(item.created_at).toLocaleString()} />
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