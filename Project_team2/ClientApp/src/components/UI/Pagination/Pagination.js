﻿import React from 'react';
import { getPagesArray } from '../../../utils/pages.js';
import classes from './Pagination.module.css'

const Pagination = ({totalCount, limit, page, changePage }) => {
    let pagesArray = getPagesArray(totalCount, limit);
    return (
        <div className={classes.pagesNav}>
            {pagesArray.map(p =>
                <span key={p}
                    onClick={() => changePage(p)}
                    className={page === p ? classes.page + ' ' + classes.pageCurrent : classes.page}>{p}</span>
            )}
        </div>
    );
};
export default Pagination;
