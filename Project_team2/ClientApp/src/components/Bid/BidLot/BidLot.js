import React, { useState } from "react";
import { useEffect } from "react";
import css from './BidLot.module.css'
import MoneySvg from "../../../images/svgDef.svg";
import { NavLink } from "react-router-dom";
import { formatTime } from "../../../utils/formatTime";
import Button from '../../UI/Button/Button';
import ModalWindow from '../../ModalWindow/ModalWindow.js'
import statusSvg from '../../../images/status.svg';

function BidLot({ bid }) {
    const [ttl, setTtl] = useState((new Date(bid.lot.timeTillEnd) - new Date()) / 1000 > 0 ? (new Date(bid.lot.timeTillEnd) - new Date()) / 1000 : 0);
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

                {ttl > 0 ?
                    <div className={css.bid}>
                        <p>Моя ставка: <span>{`${bid.maxBidAmount} ₴`}</span> </p>
                        <p>Наразі перемагає: <span>{`${bid.bidProfile.login}`}</span> </p>
                    </div> :
                    bid.lot.winnerUserId ?
                        <div className={css.winner}>
                            <div className={css.title}>
                                <svg style={{ width: "32px", height: "32px" }}>
                                    <use href={`${statusSvg}#good`} />
                                </svg>
                                Ви перемогли
                            </div>
                            <p>{`Ви перемогли з фінальною ставкою ${bid.maxBidAmount} грн, оберіть зручний спосіб доставки та оплати для отримання товару`}</p>
                        </div>
                        :

                        ''
                }

                <div className={css.desc}>
                    <div className={css.lotInfo}>

                        <p>
                            <svg>
                                <use href={`${MoneySvg}#attach_money`} />
                            </svg>
                            {bid.maxBidAmount}
                        </p>
                        <p>
                            <svg>
                                <use href={`${MoneySvg}#schedule`} />
                            </svg>
                            {ttl !== 0 ? formatTime(ttl) : "Завершений"}
                        </p>
                        <p>
                            <svg>
                                <use href={`${MoneySvg}#location`} />
                            </svg>
                            {`м. ${bid.lot.city ? bid.lot.city : "Місто"}`}
                        </p>
                    </div>
                    {bid.lot.isWaitingPayment ?
                        <Button> Оформити лот</Button> :
                        <></>
                    }

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
