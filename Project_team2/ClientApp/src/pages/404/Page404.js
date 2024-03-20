import React, { useEffect, useState } from 'react';
import css from './css.module.css'


function Page404() {

    return (
        <div id={css.notfound}>
            <div class={css.notfound}>
                <div class={css.notfound404}>
                    <h1>404</h1>
                </div>
                <h2>Oops! This Page Could Not Be Found</h2>
                <p>Sorry but the page you are looking for does not exist, have been removed. name changed or is temporarily unavailable</p>
                <a href="#">Go To Homepage</a>
            </div>
        </div>
    );

}

export default Page404;