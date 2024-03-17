import React, { useState } from "react";
import { useEffect } from "react";
import svg from "../../../images/svgDef.svg";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import { formatTime } from "../../../utils/formatTime";
import css from "../../Lot/LotSmall/LotSmall.module.css"

function BidLotSmall({ bid }) {
    const history = useHistory();

    const [ttl, setTtl] = useState((new Date(bid.lot.timeTillEnd) - new Date()) / 1000);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (ttl > 0)
            setTimeout(() => {
                setTtl(ttl - 1);
            }, 1000);
    }, [ttl]);

    return (
        <div className={css.lot} >
            <img
                src={
                    bid.lot.imageURLs ? bid.lot.imageURLs[0] : ''
                }
                className={css.image}
                alt="oleg"
                onClick={() => history.push(`/lot/${bid.lot.id}`)}
            />

            <div className={css.info} onClick={() => history.push(`/lot/${bid.lot.id}`)}>
                <div className={css.title}>{bid.lot.title}</div>
                <div className={css.desc}>{bid.lot.shortDescription}</div>
                
                <div className={css.bid}>
                    <p>Моя ставка: <span>{`${bid.maxBidAmount} ₴`}</span> </p>
                    <p>Наразі перемагає: <span>{`${bid.bidProfile.login}`}</span> </p>
                </div>

                <div className={css.text}>
                    <svg>
                        <use href={`${svg}#schedule`} />
                    </svg>
                    {formatTime(ttl)}
                </div>
                <div className={`${css.bottom}`}>
                    <div className={css.text}>
                        <svg>
                            <use href={`${svg}#attach_money`} />
                        </svg>
                        {bid.maxBidAmount}
                    </div>
                    <div className={css.text}>
                        <svg >
                            <use href={`${svg}#location`} />
                        </svg>
                        {bid.lot.city ? `м. ${bid.lot.city}` : "Location"}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default BidLotSmall;
