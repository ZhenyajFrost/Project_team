import React, { useEffect, useState } from 'react'
import css from './Bids.module.css';
import Button from '../../../components/UI/Button/Button';
import FiltersWSearch from '../../../components/FiltersWSearch/FiltersWSearch';
import useGetUserBids from '../../../API/Bids/Get/useGetUserBids';
import BidsContainer from '../../../components/UI/BidsContainer/BidsContainer';
import Pagination from '../../../components/UI/Pagination/Pagination'
import Loader from '../../../components/Loader/Loader';
import DisplayChoose from '../../../components/UI/DisplayChoose/DisplayChoose'

function Bids() {
    const [filters, setFilters] = useState({});
    const [getUserBids, bids, totalCount, isLoading, error] = useGetUserBids();
    const [bidsDisplay, setBidsDisplay] = useState('list');

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 4
    });

    useEffect(async () => {
        await getUserBids(pagination, filters)
        console.log(bids, totalCount, isLoading)
    }, [pagination])

    useEffect(() => {
        setPagination(bidsDisplay === 'list' ? { page: 1, pageSize: 4 } : { page: 1, pageSize: 8 })
    }, [bidsDisplay])

    const onFilterChange = (filterChanges) => {
        // First, clean up filterChanges to remove keys with null or "" values
        const cleanedFilterChanges = Object.entries(filterChanges).reduce((acc, [key, value]) => {
            if (value !== null && value !== "") {
                acc[key] = value;
            }
            else{
                acc[key] = null;
            }
            return acc;
        }, {});
    
        // Then, merge these cleaned changes with the existing filters
        setFilters(prevFilters => ({
            ...prevFilters,
            ...cleanedFilterChanges
        }));
    };
    
    const handleButtonSearch = async () => {
        console.log(filters)
        await getUserBids(pagination, filters);
    }


    const handleChangePage = (page) => {
        setPagination(prev => ({
            ...prev,
            page: page
        }))
    }

    return (
        <div className={css.container} style={{ padding: '0' }}>
            <FiltersWSearch initial={filters} onChange={onFilterChange} />
            <div className={css.display}>
                <Button onClick={handleButtonSearch}>Search</Button>
            </div>


            {totalCount === 0 ? "No lots Found" : isLoading ? <Loader /> : <BidsContainer bids={bids} display='list' />}
            {isLoading ? '' : <Pagination totalCount={totalCount} page={pagination.page} limit={pagination.pageSize} changePage={handleChangePage} />}

        </div>
    );

}

export default Bids;