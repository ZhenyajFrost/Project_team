import React, { useEffect, useState } from 'react'
import Button from '../../components/UI/Button/Button';
import css from './Lots/Lots.module.css'
import FiltersWSearch from '../../components/FiltersWSearch/FiltersWSearch';
import LotContainer from '../../components/UI/LotContainer/LotContainer'
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import useGetUserLikedLots from '../../API/Lots/Get/useGetUserLikedLots';
import { getLocalStorage } from '../../utils/localStorage';

function LikedLots() {
    const token = getLocalStorage('token');
    const history = useHistory();

    const [getLots, lots, totalCount, isLoading, error] = useGetUserLikedLots(); //rewrite this part

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 6
    });

    useEffect(async ()=> {
        await getLots(token, pagination.page, pagination.pageSize);
    }, [])

    return (
        <div className={css.container} style={{ padding: '0' }}>
            <div className={css.body}>

                <div className={css.lots}>
                    <LotContainer lots={lots} display="grid-4col" lotStyle="small" />
                </div>
            </div>

        </div>
    );

}

export default LikedLots;