import React from 'react';
import css from './DisplayChoose.module.css'
import svg from '../../../images/svgDef.svg'

const DisplayChoose = ({setLotDisplay, lotDisplay}) => {
    return (
        <span className={css.container}>
            <svg onClick={() => setLotDisplay("grid-2col")}>
                <use href={lotDisplay === 'grid-2col' ? `${svg}#gridView` : `${svg}#gridViewUn`} />
            </svg>
            <svg onClick={() => setLotDisplay("list")}>
                <use href={lotDisplay === 'list' ? `${svg}#listView` : `${svg}#listViewUn`} />
            </svg>
        </span>
    );
};

export default DisplayChoose;

