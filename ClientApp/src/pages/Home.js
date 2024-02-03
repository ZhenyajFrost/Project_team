import React, { Component, useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import "../styles/Home.css";
import { useFetching } from "../hooks/useFetching";
import { getPageCount, getPagesArray } from "../utils/pages.js";
import LotContainer from "../components/UI/LotContainer/LotContainer.js";
import Pagination from "../components/UI/Pagination/Pagination.js";
import Button from "../components/UI/Button/Button.js";
import InputSearch from "../components/UI/Input/InputSearch.js";
import ModalWindow from "../components/ModalWindow/ModalWindow.js";
import Login from "../components/Login/Login.js";
import LoginForgotPassword from '../components/Login/LoginForgotPassword.js';
import Loader from "../components/Loader/Loader.js";
import Registration from "../components/Registration/Registration.js";
import LoadMoreButton from "../components/LoadMoreButton/LoadMoreButton.js";
import homeImg from "../images/homeImg.svg";
import CategoryContainer from "../components/CategoryContainer/CategoryContainer.js";
import RegistrationConfirm from "../components/Registration/RegistrationConfirm.js";

export const Home = () => {
    const [lots, setLots] = useState([]);
    const [totalPages, setTotalPages] = useState();
    const [pagesToDisplay, setPagesToDisplay] = useState();
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(6);
    const [selectedSort, setSelectedSort] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [sortedLots, setSortedLots] = useState(lots);

    const [modalLogVisible, setModalLogVisible] = useState(false);
    const [modalRegVisible, setModalRegVisible] = useState(false);
    const [user, setUser] = useState({});
    const [confirmCode, setConfirmCode] = useState('');
    const [forgotPass, setForgotPass] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    let history = useHistory();
    useEffect(() => {
        setSortedLots(lots);
    }, [lots]);

    const handleSearch = (newSearchQuery) => {
        setSearchQuery(newSearchQuery);
        if (newSearchQuery) {
            // setSortedLots(lots.filter(lot =>
            //     lot.title.toLowerCase().includes(newSearchQuery.toLowerCase())
            // ));
            history.push("search/" + newSearchQuery);
        } else setSortedLots(lots);
    };

    useEffect(() => {
        setSortedLots(lots);
    }, [lots]);

    //  --Seacrh without button
    // const sortedLots = useMemo(() => {
    //     if (searchQuery) {
    //         return lots.filter(lot => lot.title.toLowerCase().includes(searchQuery.toLowerCase()));
    //     }
    //     return lots;
    // }, [searchQuery, lots]);

    const changePage = (_page) => {
        setPage(_page);
    };

    const [selectedCat, setSelectedCat] = useState("Холодильники");
    const onCategoryChange = (cat) => {
        setSelectedCat(cat);
        setPage(0);
        setLots([]);
    };

    return (
        <div>
            <div
                style={{
                    position: "relative",
                    borderRadius: "24px",
                    marginTop: "24px",
                }}
            >
                <img
                    src={homeImg}
                    alt="Description"
                    style={{ width: "100%", height: "auto", borderRadius: "24px" }}
                />
                <p className="search">
                    Створюйте та продавайте те, що вам потрібно прямо зараз
                </p>
                <div className="search">
                    <label className="seacrh">Пошук</label>
                    <InputSearch
                        onSearch={handleSearch}
                        placeholder="Введіть будь-яку позицію"
                    />
                    {/* --Search without button-- 
                     <InputSearch value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Введіть будь-яку позицію" /> */}
                </div>
            </div>
            <h2>Популярні лоти</h2>

            <CategoryContainer
                categories={[
                    "Холодильники",
                    "Іфон 13",
                    "Картини",
                    "Телевізор",
                    "Іграшки",
                    "Навушники",
                    "Колеса)",
                ]}
                onCategoryChange={onCategoryChange}
                selectedCategorie={selectedCat}
            />

            <LotContainer lots={sortedLots} />
            <LoadMoreButton
                setLots={setLots}
                curPage={page}
                setCurPage={setPage}
                perPage={limit}
            />

            <Pagination
                totalPages={pagesToDisplay}
                page={page}
                changePage={changePage}
            />
        </div>
    );
};
