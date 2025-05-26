import React, { useEffect, useState } from 'react';
import { VITE_API_URL_PREFIX } from '../../shared/configs/config.ts';
import Cell from '../../components/Cell.tsx';
import { useNavigate } from 'react-router-dom';

interface DataItem {
    id: number;
    form_type: string;

    age: number;
    profession: string;
    department: string;
    camping: string;
    conditions: string;
    help_now: boolean;
    inspiration: string;
    negative: string;
    experience: string;

    name: string;
    country: string | null;
    phone: string;
    email: string | null;
    fb: string | null;
    previously_participated: string | null;
    program_direction: string | null;
    program_description: string | null;
    event_dates: string | null;
    program_example: string | null;
    social: string | null;
    quantity: number | null;
    time: string | null;
    duration: string | null;
    lang: string | null;
    raider: string | null;
    additional_info: string | null;
    created_at: string;
    deleted_at: string | null;

    files: Array<string>;
}

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [volunteers, setVolunteers] = useState<DataItem[]>([]);
    const [masters, setMasters] = useState<DataItem[]>([]);

    useEffect(() => {
        if (!localStorage.getItem('authToken')) {
            navigate('/');
            return;
        }
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${VITE_API_URL_PREFIX}form/get_forms`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                        },
                    }
                );
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('authToken');
                        navigate('/');
                        return;
                    }
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
    }, [navigate]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;
        try {
            const response = await fetch(`${API_URL_PREFIX}form/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            });
            if (!response.ok) throw new Error('Ошибка при удалении');
            setVolunteers((prev) => prev.filter((item) => item.id !== id));
            setMasters((prev) => prev.filter((item) => item.id !== id));
        } catch {
            alert('Ошибка при удалении');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="p-8 text-slate-200">
            {volunteers.length > 0 && (
                <>
                    <h1 className="text-2xl font-bold my-4">Volunteers</h1>

                    <div className="table gap-4 w-full">

                        <div className='table-row gap-4 border sm:border-0'>
                            <Cell children="ID" />
                            <Cell children="Name" />
                            <Cell children="Age" />
                            <Cell children="Social" />
                            <Cell children="Tg" />
                            <Cell children="Profession" />
                            <Cell children="Motivation" />
                            <Cell children="Experience" />
                            <Cell children="Camping" />
                            <Cell children="Department" />
                            <Cell children="Not willing" />
                            <Cell children="Now" />
                            <Cell children="Personal" />
                            <Cell children="Created At" />
                            <Cell children="" />
                        </div>

                        {volunteers.map((item) => (
                            <React.Fragment key={item.id}>
                                <div className={`table-row gap-4 p-2 border sm:border-0 ${item?.deleted_at ? "text-gray-500 h-1" : ""}`}>
                                    <Cell children={item?.id} />
                                    <Cell children={item?.name} />
                                    <Cell children={item?.age} />
                                    <Cell children={item?.social} />
                                    <Cell children={item?.phone} />
                                    <Cell children={item?.profession || '-'} />
                                    <Cell children={item?.conditions} />
                                    <Cell children={item?.experience} />
                                    <Cell children={item?.camping} />
                                    <Tags children={item?.department} />
                                    <Cell children={item?.negative} />
                                    <Cell children={item?.help_now ? "Yes" : ""} />
                                    <Cell children={item?.inspiration} />
                                    <Cell children={new Date(item.created_at).toLocaleString()} />
                                    <Cell>
                                        {!item?.deleted_at && (
                                            <button
                                                className="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded text-lg"
                                                onClick={() => handleDelete(item.id)}
                                            >X</button>
                                        )}
                                    </Cell>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
            {masters.length > 0 && (
                <>
                    <h1 className="text-2xl font-bold my-4">Masters</h1>

                    <div className="flex flex-col gap-4 w-full">

                        <div className='flex flex-wrap border'>
                            <Cell children="ID" />
                            <Cell children="Name" />
                            <Cell children="Country" />
                            <Cell children="Tg" />
                            <Cell children="Email" />
                            <Cell children="Fb" />
                            <Cell children="Previously Participated" />
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
                            <Cell children="Additional Info" />
                            <Cell children="Created At" />
                            <Cell children="Files" />
                            <Cell children="" />
                        </div>

                        {masters.map((item) => (
                            <React.Fragment key={item.id}>
                                <div className={`flex flex-wrap border ${item?.deleted_at ? "text-gray-500 border-0" : "p-2 gap-4"}`}>
                                    <Cell children={`ID: ${item?.id}`} />
                                    <Cell children={`Name: ${item?.name}`} />
                                    <Cell children={`City: ${item?.country}`} />
                                    <Cell children={`Tg: ${item?.phone}`} />
                                    <Cell children={item?.email} />
                                    <Cell children={`Fb: ${item?.fb}`} />
                                    <Cell children={`Prev: ${item?.previously_participated ? "Yes" : "No"}`} />
                                    <Tags children={item?.program_direction} />
                                    <Cell children={item?.program_description} />
                                    <Cell children={item?.event_dates} />
                                    <Cell children={item?.program_example} />
                                    <Cell children={item?.social} />
                                    <Cell children={item?.quantity} />
                                    <Cell children={item?.time} />
                                    <Cell children={item?.duration} />
                                    <Cell children={item?.lang} />
                                    <Cell children={item?.raider} />
                                    <Cell children={item?.additional_info} />
                                    <Cell children={new Date(item.created_at).toLocaleString()} />
                                    <Cell children={item?.files.map((file, index) => {
                                        const isImage = file.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
                                        const isVideo = file.match(/\.(mp4|webm|ogg)$/i);

                                        return item?.deleted_at ? "" : (
                                            <div key={index}>
                                                {isImage && <img src={file} alt={`Preview ${index}`} className="w-20 h-20 object-cover" />}
                                                {isVideo && (
                                                    <video controls className="w-20 h-20">
                                                        <source src={file} type={`video/${file.split('.').pop()}`} />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                )}
                                                {!isImage && !isVideo && (
                                                    <a href={file} target="_blank" rel="noopener noreferrer">
                                                        {file}
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })} />
                                    <Cell>
                                        {!item?.deleted_at && (
                                            <button
                                                className="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded text-lg"
                                                onClick={() => handleDelete(item.id)}
                                            >X</button>
                                        )}
                                    </Cell>
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
