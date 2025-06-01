import React, {useEffect, useMemo} from 'react';
import {useSearchParams} from "react-router-dom";
import debounce from 'debounce'

import {MainLayout} from "../../widgets/layouts/main";
import {useMasterListStore} from "../../entities/master";
import {MasterTable} from "../../widgets/master";

export const MasterPage: React.FC = () => {
    const [search] = useSearchParams()
    const { getList } = useMasterListStore()

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
        <MainLayout header={'Masters'}>
            <MasterTable/>
        </MainLayout>
    )
};
