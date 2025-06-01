import React, {useEffect, useMemo} from 'react';
import {useSearchParams} from "react-router-dom";
import debounce from 'debounce'

import {useVolunteerListStore} from "../../entities/volunteer";
import {VolunteersTable} from "../../widgets/volunteer/ui.tsx";
import {MainLayout} from "../../widgets/layouts/main";

export const VolunteerPage: React.FC = () => {
    const [search] = useSearchParams()
    const { getList } = useVolunteerListStore()

    const debouncedResults = useMemo(() => {
        return debounce(() => getList(search), 300)
    }, [getList, search])

    useEffect(() => {
        debouncedResults()

        return () => {
            debouncedResults.clear()
        }
    }, [debouncedResults])

    return (
        <MainLayout header={'Volunteers'}>
            <VolunteersTable/>
        </MainLayout>
    )
};
