import React, {useEffect, useMemo} from 'react';
import {useSearchParams} from "react-router-dom";
import debounce from 'debounce'

import {useVolunteerListStore} from "../../entities/volunteer";

export const Volunteers: React.FC = () => {
    const [search] = useSearchParams()
    const { getList } = useVolunteerListStore()

    const debouncedResults = useMemo(() => {
        console.log('search')
        return debounce(() => getList(search), 300)
    }, [getList, search])

    useEffect(() => {
        debouncedResults()

        return () => {
            debouncedResults.clear()
        }
    }, [debouncedResults])

    return (<a href={'/volunteers'}>Volunteers</a>)
};
