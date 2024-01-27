import React, { Component, useState, useEffect, useMemo } from 'react';
import '../styles/Home.css';
import { useFetching } from "../hooks/useFetching";
import { getPageCount, getPagesArray } from '../utils/pages.js';
import LotContainer from '../components/UI/LotContainer/LotContainer.js';
import Pagination from '../components/UI/Pagination/Pagination.js';
import Button from '../components/UI/Button/Button.js';
import Input from '../components/UI/Input/Input'
import ModalWindow from '../components/ModalWindow/ModalWindow.js';
import Login from '../components/Login/Login.js';
import Loader from '../components/Loader/Loader.js';
import Registration from '../components/Registration/Registration.js';
import LoadMoreButton from '../components/LoadMoreButton/LoadMoreButton.js';


export const Home = () => {
    const [lots, setLots] = useState([])
    const [totalPages, setTotalPages] = useState();
    const [pagesToDisplay, setPagesToDisplay] = useState();
    const [page, setPage] = useState(0)
    const [limit, setLimit] = useState(6);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleReg, setModalVisibleReg] = useState(false);
    const [selectedSort, setSelectedSort] = useState('');

    const [searchQuery, setSearchQuery] = useState('');

    const sortedLots = useMemo(() => {
        if (searchQuery) {
            return lots.filter(lot => lot.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return lots;
    }, [searchQuery, lots]);

    const changePage = (_page) => {
        setPage(_page)
    }

    

    // useEffect(() => {
    //     fetchLots()
    // }, [page, limit])

    return (
        <div>
            <h1>HOME</h1>

            <div>
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search" />
            </div>

            <LotContainer lots={sortedLots} setLots={setLots} setPage={setPage}/>
            <LoadMoreButton setLots={setLots} curPage={page} setCurPage={setPage} perPage={limit}/>

            <Pagination totalPages={pagesToDisplay} page={page} changePage={changePage} />

            <Button onClick={() => setModalVisible(true)}>Modal Window Show</Button>
            <ModalWindow visible={modalVisible} setVisible={setModalVisible}>
                <Login />
                <Button onClick={() => setModalVisible(false)}>Modal Window Close</Button>
            </ModalWindow>

            <Button onClick={() => setModalVisibleReg(true)}>Modal Reg Window Show</Button>
            <ModalWindow visible={modalVisibleReg} setVisible={setModalVisibleReg}>
                <Registration />
                <Button onClick={() => setModalVisibleReg(false)}>Modal Window Close</Button>
            </ModalWindow>

        </div>
    );



}