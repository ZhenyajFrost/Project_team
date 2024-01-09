import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import Lot from '../Lot/Lot.js'
import classes from './LotContainer.module.css'

function LotContainer({lots, filter}) {

    return (
        <div className={classes.lotsContainer}>
            {lots.map(lot =>
                <Lot id={lot.id}
                    title={lot.title}
                    price={lot.price}
                    shortDescription={lot.shortDescription}
                    timeTillEnd={lot.timeTillEnd}
                    hot={lot.hot}
                    imageURL={lot.imageURL} />)}
        </div>
    )
}

export default LotContainer;