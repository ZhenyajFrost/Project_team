import React, { useEffect, useState } from 'react'
import css from './Lots/Lots.module.css'
import LotContainer from '../../components/UI/LotContainer/LotContainer'
import useGetUserLikedLots from '../../API/Lots/Get/useGetUserLikedLots';
import useGetUserSubscriptions from '../../API/User/Get/useGetUserSubscriptions';
import Loader from '../../components/Loader/Loader';
import UserContainer from '../../components/UI/UserContainer/UserContainer';
import Pagination from '../../components/UI/Pagination/Pagination'

function LikedItems() {
    const [activeTab, setActiveTab] = useState(sessionStorage.getItem('activeTab') || 'lots');

    const [getLots, lots, totalCount, isLoading, error] = useGetUserLikedLots();
    const [getUserSubscriptions, likedUsers, isLoadingUS, errorUs] = useGetUserSubscriptions();

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 6
    });

    useEffect(async () => {
        if (activeTab === 'lots')
            await getLots(pagination.page, pagination.pageSize);
        if (activeTab === 'users')
            await getUserSubscriptions();
    }, [activeTab, pagination])

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        sessionStorage.setItem('activeTab', tab);

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
                    {
                        activeTab === 'lots' ? (
                            isLoading ? (
                                <Loader />
                            ) : (
                                <>
                                    {totalCount === 0 ? "Items are not found" :
                                        <>
                                            <LotContainer lots={lots} display="listWrap" lotStyle="small" />
                                            <Pagination
                                                totalCount={totalCount}
                                                page={pagination.page}
                                                limit={pagination.pageSize}
                                                changePage={(page) => setPagination(prev => ({ ...prev, page }))}
                                            /></>
                                    }
                                </>
                            )
                        ) : activeTab === 'users' ? (
                            isLoadingUS ? (
                                <Loader />
                            ) : (
                                <UserContainer users={likedUsers} display="listWrap" />
                            )
                        ) : (
                            "Оберіть вкладку" // This translates to "Select a tab" in English
                        )
                    }
                </div>
            </div>

        </div>
    );

}

export default LikedItems;