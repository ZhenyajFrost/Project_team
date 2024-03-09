import React from 'react';
import { getPageCount } from '../../../utils/pages';
import classes from './Pagination.module.css';

const Pagination = ({ totalCount, limit, page, changePage }) => {
  const totalPages = getPageCount(totalCount, limit);
  const maxPageVisible = 3; // Maximum number of pages to display before the ellipsis

  let pages = [];
  
  // Determine the start and end of the pagination numbers
  let startPage = Math.max(page - 1, 1);
  let endPage = Math.min(startPage + maxPageVisible - 1, totalPages);

  if (endPage - startPage < maxPageVisible - 1) {
    startPage = Math.max(endPage - maxPageVisible + 1, 1);
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

  // Add ellipsis and last page if needed
  if (endPage < totalPages) {
    pages.push(<span key="ellipsis" className={classes.ellipsis}>...</span>);
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

  // Add next page arrow
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
