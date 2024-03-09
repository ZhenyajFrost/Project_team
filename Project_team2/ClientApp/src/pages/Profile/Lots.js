import React, { useEffect, useState } from 'react'
import Button from '../../components/UI/Button/Button';
import css from './Lots.module.css'
import svg from "../../images/svgDef.svg";
import FiltersWSearch from '../../components/FiltersWSearch/FiltersWSearch';
import FilterCategory from '../../components/FilterCategory/FilterCategory';
import LotContainer from '../../components/UI/LotContainer/LotContainer'
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import useGetLotsByUser from '../../API/Lots/useGetLotsByUser';
import { getLocalStorage } from '../../utils/localStorage';
import { categoriesFromLots } from '../../utils/catedoriesFromLots';
import Pagination from '../../components/UI/Pagination/Pagination.js';

function Lots() {
    const user = getLocalStorage('user');
    const history = useHistory();
    const [activeTab, setActiveTab] = useState('Active');

    const [filters, setFilters] = useState({});
    const [categoryClicked, setCategoryClicked] = useState('');

    const [getLots, lots, totalCount, isLoading, error] = useGetLotsByUser(); //rewrite this part

    const categories = categoriesFromLots(lots);

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 6
    });

    const handleChangePage = (page) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: page
        }))
    }

    const handleTabClick = async (tab) => {
        setActiveTab(tab);
        setFilters({});
    };

    useEffect(async () => {
        await getLots(user.id, pagination.pageNumber, pagination.pageSize, filters);
    }, [activeTab, pagination])

    const handleButtonSearch = async () => {
        await getLots(user.id, pagination.page, pagination.pageSize, activeTab, filters);
    }

    const handleAddButton = () => {
        history.push('/create');
    }

    const onFilterChange = (filterChanges) => {
        setFilters(prev => ({
            ...prev,
            ...filterChanges
        }));
    };

    return (
        <div className={css.container} style={{ padding: '0' }}>
            <div className={css.header}>
                <ul className={css.tabContainer}>
                    <li
                        className={`${css.tab} ${activeTab === 'Active' ? css.activeTab : ''}`}
                        onClick={() => handleTabClick('Active')}
                    >
                        Активні
                    </li>
                    <li
                        className={`${css.tab} ${activeTab === 'Unactive' ? css.activeTab : ''}`}
                        onClick={() => handleTabClick('Unactive')}
                    >
                        Неактивні
                    </li>
                    <li
                        className={`${css.tab} ${activeTab === 'Archive' ? css.activeTab : ''}`}
                        onClick={() => handleTabClick('Archive')}
                    >
                        Архів
                    </li>
                </ul>

                <Button className={css.btn} onClick={handleAddButton}>
                    <svg>
                        <use href={`${svg}#plus`} />
                    </svg>
                    Додати оголошення
                </Button>
            </div>

            <FiltersWSearch onChange={onFilterChange} initial={filters} />
            <Button onClick={handleButtonSearch}>Search</Button>

            <div className={css.body}>
                <FilterCategory onChange={onFilterChange} setCategoryClicked={setCategoryClicked} categories={categories} />

                <div className={css.lots}>
                    {totalCount === 0 ? "No lots Found" : <LotContainer lots={lots} display="grid-3col" lotStyle="small" />}
                    <Pagination totalCount={totalCount} page={pagination.pageNumber} limit={pagination.pageSize} changePage={handleChangePage} />
                </div>
            </div>

        </div>
    );

}

export default Lots;