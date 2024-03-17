import React, { useState } from "react";
import { useEffect } from "react";
import css from './BidLot.module.css'
import MoneySvg from "../../../images/svgDef.svg";
import { NavLink } from "react-router-dom";
import { formatTime } from "../../../utils/formatTime";
import Button from '../../UI/Button/Button';
import ModalWindow from '../../ModalWindow/ModalWindow.js'

function BidLot({ bid }) {
    const [ttl, setTtl] = useState((new Date(bid.lot.timeTillEnd) - new Date()) / 1000);
    //console.log("SEC:", (new Date(bid.lot.timeTillEnd) - new Date()) / 1000);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (ttl > 0)
            setTimeout(() => {
                setTtl(ttl - 1);
            }, 1000);
    }, [ttl]);

    return (
        <div className={`${css.lot} ${ttl > 0 ? css.active : css.inactive}`}>
            <img
                src={
                    bid.lot.imageURLs ? bid.lot.imageURLs[0] : ''
                }
                className={css.lotImage}
                alt="oleg"
            />
            <div className={css.lotText}>
                <h3 className={`${css.lotTitle}`}>{bid.lot.title}</h3>
                <p className={css.lotDesc}>{bid.lot.shortDescription}</p>

                <div className={css.bid}>
                    <p>Моя ставка: <span>{`${bid.maxBidAmount} ₴`}</span> </p>
                    <p>Наразі перемагає: <span>{`${bid.bidProfile.login}`}</span> </p>
                </div>

                <div className={css.lotInfo}>
                    <p>
                        <svg>
                            <use href={`${MoneySvg}#attach_money`} />
                        </svg>
                        {bid.lot.price}
                    </p>
                    <p>
                        <svg>
                            <use href={`${MoneySvg}#schedule`} />
                        </svg>
                        {formatTime(ttl)}
                    </p>
                    <p>
                        <svg>
                            <use href={`${MoneySvg}#location`} />
                        </svg>
                        {`м. ${bid.lot.city}`}
                    </p>
                    <NavLink to={"/lot/" + bid.lot.id} className={css.arrowOutward}>
                        <svg>
                            <use href={`${MoneySvg}#arrow_outward`} />
                        </svg>
                    </NavLink>
                </div>


            </div>

            <ModalWindow visible={modalVisible} setVisible={setModalVisible}>
            </ModalWindow>
        </div>

    );
}

export default BidLot;
