import React, { Component, useState, useEffect, useMemo } from 'react';
import '../styles/Home.css';
import { useFetching } from "../hooks/useFetching";
import PostService from '../API/PostService';
import { getPageCount, getPagesArray } from '../utils/pages.js';
import LotContainer from '../components/UI/LotContainer/LotContainer.js';
import Pagination from '../components/UI/Pagination/Pagination.js';
import Button from '../components/UI/Button/Button.js';
import Input from '../components/UI/Input/Input'
import ModalWindow from '../components/ModalWindow/ModalWindow.js';
import Lot from '../components/Lot/Lot';

export const Home = () => {
    const [lots, setLots] = useState([])
    const [totalPages, setTotalPages] = useState();
    const [pagesToDisplay, setPagesToDisplay] = useState();
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSort, setSelectedSort] = useState('');

    const [searchQuery, setSearchQuery] = useState('');

    const sortedLots = useMemo(() => {
        if (searchQuery) {
            return lots.filter(lot => lot.title.includes(searchQuery));
        }
        return lots;
    }, [ searchQuery, lots ]);

    const changePage = (_page) => {    
        setPage(_page)
    }    

    const [fetchLots, isLoading, lotsError] = useFetching(async() => {
        const response = await PostService.getAll(limit, page);
        const data = await response.json();

        setTotalPages(data.length);
        setLots(data);
        setPagesToDisplay(getPageCount(data.length, limit));
    })
    
    useEffect(() => {  
        fetchLots()
    },[page, limit])

    return (
        <div>
            <h1>HOME</h1>

            <div>
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search" />
            </div>

            <LotContainer lots={sortedLots} />
            <Pagination totalPages={pagesToDisplay} page={page} changePage={changePage}/>

            <Button onClick={() => setModalVisible(true)}>Modal Window Show</Button>
            <ModalWindow visible={modalVisible} setVisible={setModalVisible}>
                <h1>Modal Window</h1>
                <Button onClick={() => setModalVisible(false)}>Modal Window Close</Button>
            </ModalWindow>
        </div>
    );


}
