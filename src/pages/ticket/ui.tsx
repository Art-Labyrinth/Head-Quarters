import React, {useEffect, useMemo} from 'react';
import {useSearchParams} from "react-router-dom";
import debounce from 'debounce'

import {MainLayout} from "../../widgets/layouts/main";
import {useTicketListStore} from "../../entities/ticket";
import {TicketTable} from "../../widgets/ticket";

export const TicketPage: React.FC = () => {
    const [search] = useSearchParams()
    const { getList } = useTicketListStore()

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
        <MainLayout header={'Tickets'}>
            <TicketTable/>
        </MainLayout>
    )
};
