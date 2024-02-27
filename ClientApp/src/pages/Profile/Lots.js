import React, { useState } from 'react'
import Button from '../../components/UI/Button/Button';
import css from './Lots.module.css'
import svg from "../../images/svgDef.svg";
import FiltersWSearch from '../../components/FiltersWSearch/FiltersWSearch';
import FilterCategory from '../../components/FilterCategory/FilterCategory';
import LotContainer from '../../components/UI/LotContainer/LotContainer'
import { useHistory } from 'react-router-dom/cjs/react-router-dom';

function Lots({ user }) {
    const history = useHistory();
    const [activeTab, setActiveTab] = useState('Active');
    const [filter, setFilter] = useState({});
    const categories = [{ label: 'Антикваріат', value: 'antic', quantity: 10 },
    { label: 'Дім', value: 'home', quantity: 12 }]; //WRITE LOGIC

    const [lots, setLots] = useState([]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleAddButton = () => {
        history.push('/create');
    }

    const onFilterChange = (e) => {
        setFilter(e);
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
                        className={`${css.tab} ${activeTab === 'Inactive' ? css.activeTab : ''}`}
                        onClick={() => handleTabClick('Inactive')}
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

            <FiltersWSearch onChange={onFilterChange} initial={filter} />

            <div className={css.body}>
                <FilterCategory categories={categories} setLots={setLots}/>
                
                <div className={css.lots}>
                {activeTab === 'Active' ? <LotContainer lots={lots} display="grid-3col" lotStyle="small" /> : <></>}
                {activeTab === 'Inactive' && <p>Showing Inactive items...</p>}
                {activeTab === 'Archive' && <p>Showing Archived items...</p>}

                </div>

            </div>

        </div>
    );

}

export default Lots;