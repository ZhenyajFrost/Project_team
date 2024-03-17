import React, { useEffect, useState } from 'react'
import css from './Bids.module.css';
import FiltersWSearch from '../../../components/FiltersWSearch/FiltersWSearch';
import useGetLotsByUser from '../../../API/Lots/Get/useGetLotsByUser';
import useGetUserBids from '../../../API/Bids/Get/useGetUserBids';
import BidsContainer from '../../../components/UI/BidsContainer/BidsContainer';

function Bids() {
    const [filters, setFilters] = useState({}); 
    const [getUserBids, bids, totalCount, isLoading, error ] = useGetUserBids();

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 6
    });

    useEffect(async () => {
        await getUserBids(pagination)
    }, [pagination])

    const onFilterChange = (filterChanges) => {
        setFilters(prev => ({
            ...prev,
            ...filterChanges
        }));
    };

    return (
        <div className={css.container} style={{ padding: '0' }}>
            <FiltersWSearch initial={filters} onChange={onFilterChange}/>

            <BidsContainer bids={bids} display='list'/>
        </div>
    );

}

export default Bids;