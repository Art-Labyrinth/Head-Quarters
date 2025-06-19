import React, {useEffect, useMemo, useCallback} from 'react';
import {useSearchParams} from "react-router-dom";
import debounce from 'debounce'

import {MainLayout} from "../../widgets/layouts/main";
import {useTicketListStore} from "../../entities/ticket";
import {TicketTable} from "../../widgets/ticket";

export const TicketPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { getList, count } = useTicketListStore();
    const itemsPerPage = 10;
    const currentPage = Number(searchParams.get('page')) || 1;

    const fetchList = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('offset', String((currentPage - 1) * itemsPerPage));
        params.set('limit', String(itemsPerPage));
        getList(params);
    }, [getList, searchParams, currentPage]);

    const debouncedResults = useMemo(() => {
        return debounce(fetchList, 300);
    }, [fetchList]);

    useEffect(() => {
        debouncedResults();
        return () => {
            debouncedResults.clear();
        }
    }, [debouncedResults]);

    return (
        <MainLayout header={'Tickets'}>
            <TicketTable
                currentPage={currentPage}
                setCurrentPage={(page: number) => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page) })}
                itemsPerPage={itemsPerPage}
                totalCount={count}
            />
        </MainLayout>
    )
};
