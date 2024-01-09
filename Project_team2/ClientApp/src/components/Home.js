import React, { Component, useState, useEffect } from 'react';
import { useFetching } from "./hooks/useFetching";
import LotContainer from './LotContainer/LotContainer';
import PostService from '../API/PostService';
import { getPageCount, getPagesArray } from '../utils/pages';
import '../styles/Home.css';

export const Home = () => {
    const [lots, setLots] = useState([])
    const [totalPages, setTotalPages] = useState();
    const [pagesToDisplay, setPagesToDisplay] = useState();
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12);
    let pagesArray = getPagesArray(pagesToDisplay);

    const changePage = (_page) => {
        console.log(page);        
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
            <LotContainer lots={lots} />

            <div className="pages-nav">
                {pagesArray.map(p =>
                    <span key={p}    
                        onClick={() => changePage(p)}
                        className={page === p ? 'page page_current' : 'page'}>{p}</span>
                )}
            </div>

        </div>
    );


}
