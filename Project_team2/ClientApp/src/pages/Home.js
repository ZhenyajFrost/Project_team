import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import css from "../styles/Home.module.css";
import LotContainer from "../components/UI/LotContainer/LotContainer.js";
import InputSearch from "../components/UI/Input/InputSearch.js";
import LoadMoreButton from "../components/LoadMoreButton/LoadMoreButton.js";
import homeImg from "../images/homeImg.svg";
import CategoryContainer from "../components/SmallCategoryContainer/SmallCategoryContainer.js";
import Button from "../components/UI/Button/Button.js";
import howItWorksImg from "../images/howItWorks.svg"
import svg from "../images/svgDef.svg";
import BigCategoryContainer from "../components/BigCategoryContainer/BigCategoryContainer.js";
import useGetLots from "../API/Lots/Get/useGetLots.js";
import categories from "../Data/categories.json"

export const Home = () => {
    const [getLots, lots, totalCount, isLoading, error] = useGetLots();
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 4
    });

    const [sortedLots, setSortedLots] = useState(lots);
    let history = useHistory();

    useEffect(() => {
        setSortedLots(lots);
    }, [lots]);
    
    // useEffect(async () => {
    //     await getLots(pagination.page, pagination.pageSize);
    // }, [])

    useEffect(async () => {
        console.log(pagination);
        await getLots(1, pagination.pageSize * pagination.page);
    }, [pagination])

    const handleSearch = (newSearchQuery) => {
        if (newSearchQuery) {
            history.push("search/" + newSearchQuery);
        } 
    };

    useEffect(() => {
        setSortedLots(lots);
    }, [lots]);



    const [selectedCat, setSelectedCat] = useState(categories[0]);
    const onCategoryChange = (cat) => {
        setSelectedCat(cat);
        setPagination({page: 1, limit: 10});
        //setLots([]);
        ///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1///TODO: MAKE THIS SHIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
    };

    return (
        <div style={{display: "flex", flexDirection: "column", gap: "8vw"}}>
            <div id="search" style={{ position: "relative", borderRadius: "24px", marginTop: "1.5vw" }}>
                <img src={homeImg} alt="Description" style={{ width: "100%", height: "auto", borderRadius: "24px" }} />
                <p className={css.search}>Створюйте та продавайте те, що вам потрібно прямо зараз</p>
                <div className={`${css.search} ${css.borderRadius24}`} style={{ backgroundColor: "white" }}>
                    <label className={css.search}>Пошук</label>
                    <InputSearch onSearch={handleSearch} placeholder="Введіть будь-яку позицію" />
                </div>
            </div>

            <div id="categories">
                <h2>Популярні категорії</h2>
                <BigCategoryContainer categories={categories} />
            </div>


            <div id="lots">
                <h2 className={css.h2}>Популярні лоти</h2>
                <CategoryContainer categories={categories} onCategoryChange={onCategoryChange} selectedCategorie={selectedCat} />

                <LotContainer lots={sortedLots} display="grid-2col"/>
                <LoadMoreButton curPage={pagination.page} setCurPage={(newPage) => setPagination(prev => ({
                    ...prev,
                    page: newPage
                }))} limit={pagination.limit} />
            </div>

            <div id="howItW" className={`${css.mainCont} ${css.borderRadius24}`}>
                <div className={`${css.container} ${css.flexColumn}`}>
                    <h2 className={css.h2}>Як це працює?</h2>
                    <div className={`${css.element} ${css.flexColumn}`}>
                        <div className={css.header}>
                            <div className={css.point}>01</div>
                            <h4 className={css.h4}>Реєстрація та підготовка</h4>
                        </div>
                        <div className={css.text}>
                            Учасники торгів реєструються на аукціонній платформі та отримують доступ до каталогу лотів і правил аукціону. Вони проводять попереднє дослідження лотів.
                        </div>
                    </div>
                    <div className={`${css.element} ${css.flexColumn}`}>
                        <div className={css.header}>
                            <div className={css.point}>02</div>
                            <h4 className={css.h4}>Попередні торги та подання тендерних пропозицій</h4>
                        </div>
                        <div className={css.text}>
                            Учасники подають заявки на участь у попередніх торгах, де вони можуть брати участь в електронних або закритих торгах.
                        </div>
                    </div>
                    <Button className={css.button} onClick={() => history.push('/howItWorks')}>Детальніше</Button>
                </div>
                <div className={`${css.img} ${css.borderRadius24}`}>
                    <img className={css.img} src={howItWorksImg} alt="How It Works" />
                </div>
            </div>

            <div id="questions" className={`${css.mainContQuest} ${css.borderRadius24} ${css.flexColumn}`}>
                <h2 className={css.h2}>Популярне запитання</h2>
                <div className={`${css.containerQuest}`}>
                    <div className={`${css.elementQuest} ${css.borderRadius24} `}>
                        <div className={`${css.headerQuest} ${css.flexColumn}`}>
                            <div className={css.arrowQuest}>
                                <svg>
                                    <use href={`${svg}#arrow_outward`} />
                                </svg>
                            </div>
                            <div className={css.textQuest}>Які обов'язкові дані потрібно вказати при реєстрації на нашій аукціонній платформі?</div>
                        </div>
                    </div>
                    <div className={`${css.elementQuest} ${css.borderRadius24}`}>
                        <div className={`${css.headerQuest} ${css.flexColumn}`}>
                            <div className={css.arrowQuest}>
                                <svg>
                                    <use href={`${svg}#arrow_outward`} />
                                </svg>
                            </div>
                            <div className={css.textQuest}>Як ви забезпечуєте прозорість і чесність тендерного процесу, а також вирішуєте можливі суперечки між учасниками?</div>
                        </div>
                    </div>
                    <div className={`${css.elementQuest} ${css.borderRadius24}`}>
                        <div className={`${css.headerQuest} ${css.flexColumn}`}>
                            <div className={css.arrowQuest}>
                                <svg>
                                    <use href={`${svg}#arrow_outward`} />
                                </svg>
                            </div>
                            <div className={css.textQuest}>Як відбувається передача майна після успішних торгів, і як ви гарантуєте законність цього процесу</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
