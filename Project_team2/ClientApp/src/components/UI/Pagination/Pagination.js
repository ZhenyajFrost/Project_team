import React, { useEffect } from 'react';
import { getPageCount } from '../../../utils/pages';
import classes from './Pagination.module.css';

const Pagination = ({ totalCount, limit, page, changePage }) => {
  const totalPages = getPageCount(totalCount, limit);
  const maxPageVisible = 3; 

  useEffect(() => {
    console.log(`totalCount`, totalCount);
    console.log(`limit`, limit);
    console.log(`page`, totalCount);
    

  }, [])

  let pages = [];
  
  let startPage = Math.max(page - 1, 1);
  let endPage = Math.min(startPage + maxPageVisible - 1, totalPages);

  if (endPage - startPage < maxPageVisible - 1) {
    startPage = Math.max(endPage - maxPageVisible + 1, 1);
  }

  // Add previous page arrow if not on the first page
  if (page > 1) {
    pages.push(
      <span
        key="prev"
        onClick={() => changePage(page - 1)}
        className={classes.prevPage}
      >
        &lt;
      </span>
    );
  }

  // Condition to add first page and ellipsis at the beginning
  if (startPage > 2) {
    pages.push(
      <span
        key="1"
        onClick={() => changePage(1)}
        className={classes.page}
      >
        1
      </span>
    );
    pages.push(<span key="startEllipsis" className={classes.ellipsis}>...</span>);
  } else if (startPage === 2) {
    // Just add the first page if startPage is 2
    pages.push(
      <span
        key="1"
        onClick={() => changePage(1)}
        className={classes.page}
      >
        1
      </span>
    );
  }

  // Generate page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <span
        key={i}
        onClick={() => changePage(i)}
        className={page === i ? `${classes.page} ${classes.pageCurrent}` : classes.page}
      >
        {i}
      </span>
    );
  }

  // Add ellipsis and last page if needed and not immediately after current set
  if (endPage < totalPages - 1) {
    pages.push(<span key="endEllipsis" className={classes.ellipsis}>...</span>);
  }

  if (endPage < totalPages) {
    pages.push(
      <span
        key={totalPages}
        onClick={() => changePage(totalPages)}
        className={classes.page}
      >
        {totalPages}
      </span>
    );
  }

  // Add next page arrow if not on the last page
  if (page < totalPages) {
    pages.push(
      <span
        key="next"
        onClick={() => changePage(page + 1)}
        className={classes.nextPage}
      >
        &gt;
      </span>
    );
  }

  return (
    <div className={classes.pagesNav}>
      {pages}
    </div>
  );
};

export default Pagination;
