import React, { useEffect, useState } from 'react'
import css from './Lots/Lots.module.css'
import LotContainer from '../../components/UI/LotContainer/LotContainer'
import useGetUserLikedLots from '../../API/Lots/Get/useGetUserLikedLots';
import useGetUserSubscriptions from '../../API/User/Get/useGetUserSubscriptions';
import Loader from '../../components/Loader/Loader';
import UserContainer from '../../components/UI/UserContainer/UserContainer';

function LikedItems() {
    const [activeTab, setActiveTab] = useState('lots');

    const [getLots, lots, totalCount, isLoading, error] = useGetUserLikedLots();
    const [getUserSubscriptions, likedUsers, isLoadingUS, errorUs] = useGetUserSubscriptions();

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 6
    });

    useEffect(async () => {
        if (activeTab === 'lots')
            await getLots(pagination.page, pagination.pageSize);
        if(activeTab === 'users')
            await getUserSubscriptions();
    }, [activeTab])

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={css.container} style={{ padding: '0' }}>
            <ul className={css.tabContainer}>
                <li
                    className={`${css.tab} ${activeTab === 'lots' ? css.activeTab : ''}`}
                    onClick={() => handleTabClick('lots')}
                >
                    Лоти
                </li>
                <li
                    className={`${css.tab} ${activeTab === 'users' ? css.activeTab : ''}`}
                    onClick={() => handleTabClick('users')}
                >
                    Автори
                </li>
            </ul>

            <div className={`${css.body}Liked`}>
                <div className={css.lots}>
                {console.log(activeTab, isLoadingUS, likedUsers)}
                    {activeTab === 'lots' && isLoading ? <Loader/> :<LotContainer lots={lots} display="listWrap" lotStyle="small" />}
                    {activeTab === 'users' ? <Loader/> : <UserContainer users={likedUsers}/>}
                </div>
            </div>

        </div>
    );

}

export default LikedItems;