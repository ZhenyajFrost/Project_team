import React, { useEffect, useState } from 'react'
import Button from '../../components/UI/Button/Button.js';
import css from './UserPage.module.css'
import FiltersWSearch from '../../components/FiltersWSearch/FiltersWSearch.js';
import FilterCategory from '../../components/FilterCategory/FilterCategory.js';
import LotContainer from '../../components/UI/LotContainer/LotContainer.js'
import { categoriesFromCategoriesCount } from '../../utils/categoriesFromCategoriesCount.js';
import Pagination from '../../components/UI/Pagination/Pagination.js';
import useGetUserProfile from '../../API/User/Get/useGetUserProfile.js'
import SubscribeButton from '../../components/UI/SubscribeButton/SubscribeButton.js';
import { getLocalStorage } from '../../utils/localStorage.js';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min.js';
import useGetUserLots from '../../API/Lots/Get/useGetUserLots.js';

function UserPage() {
    const thisUser = getLocalStorage('user');
    const thisUserId = thisUser ? thisUser.id : null;

    const userId = parseInt(window.location.href.split("/").pop(), 10);

    const [getUserProfile, user, isLoadingUs, errorUs]= useGetUserProfile();

    const [filters, setFilters] = useState({});
    const [categoryClicked, setCategoryClicked] = useState({ value: '' });

    const [getLots, lots, _totalCount, categoriesCount, isLoading, error] = useGetUserLots(); //rewrite this part
    const categories = categoriesFromCategoriesCount(categoriesCount);

    const totalCount = categories.reduce((accumulator, currentCategory) => {
        return accumulator + currentCategory.count;
    }, 0);

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 9
    });

    useEffect(() => {
        async function fetchData() {
            await getUserProfile(userId);
        }
        fetchData();
    }, [userId]);

    useEffect(async () => {
        await getLots(userId, pagination.pageNumber, pagination.pageSize, filters);
    }, [pagination, categoryClicked]) //Filters 

    useEffect(async () => {
        setPagination({ pageNumber: 1, pageSize: 9 })
    }, [categoryClicked]) //Filters 

    const handleChangePage = (page) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: page
        }))
    }

    const handleButtonSearch = async () => {
        await getLots(user.id, pagination.page, pagination.pageSize, filters);
    }

    const onFilterChange = (filterChanges) => {
        setFilters(prev => ({
            ...prev,
            ...filterChanges
        }));
    };

    if(Number(userId) === Number(thisUserId)){
        console.log("userId === rhisId")
        return <Redirect to="/profile"/>;
    }

    return (
        <div className={css.container} style={{ padding: '0' }}>
            <div className={css.header}>
                <div className={css.user}>
                    <img className={css.avatar} src={user.avatar} />
                    <span> { user.firstName ? `${user.firstName} ${user.lastName}` : user.login}</span>

                </div>

                <SubscribeButton userId={userId}/>
            </div>

            <FiltersWSearch onChange={onFilterChange} initial={filters} />
            <Button onClick={handleButtonSearch}>Search</Button>

            <div className={css.body}>
                <FilterCategory onChange={onFilterChange} setCategoryClicked={setCategoryClicked} categories={categories} totalCount={totalCount} categoryClicked={categoryClicked} />

                <div className={css.lots}>
                    {_totalCount === 0 ? "No lots Found" : <LotContainer lots={lots} display="listWrap" lotStyle="small" />}
                    <Pagination totalCount={_totalCount} page={pagination.pageNumber} limit={pagination.pageSize} changePage={handleChangePage} />
                </div>
            </div>

        </div>
    );

}

export default UserPage;