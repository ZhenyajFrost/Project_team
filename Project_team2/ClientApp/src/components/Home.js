import React, { Component, useState, useEffect } from 'react';
import { useFetching } from "./hooks/useFetching";
import LotContainer from './LotContainer/LotContainer';
import PostService from '../API/PostService';
import { getPageCount } from '../utils/pages';

export const Home = () => {
    const [lots, setLots] = useState([])
    const [totalPages, setTotalPages] = useState();
    const [pagesToDisplay, setPagesToDisplay] = useState();
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(25);


    const [fetchLots, isLoading, lotsError] = useFetching(async() => {
        const response = await PostService.getAll(limit, page);
        const data = await response.json();
        setTotalPages(data.length);
        setLots(data);
        setPagesToDisplay(getPageCount(data.length, limit));
    })
    console.log(limit, totalPages);
    console.log(pagesToDisplay);
    useEffect(() => {
        fetchLots()
    },[page, limit])

    return (
        <div>
            <LotContainer lots={lots} />
        </div>
    );


}
