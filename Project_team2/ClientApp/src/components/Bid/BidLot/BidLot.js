import React, { useState, useEffect } from "react";
import css from './BidLot.module.css'
import svg from "../../../images/svgDef.svg";
import { NavLink } from "react-router-dom";
import { formatTime } from "../../../utils/formatTime";
import Button from '../../UI/Button/Button';
import ModalWindow from '../../ModalWindow/ModalWindow.js'
import statusSvg from '../../../images/status.svg';
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import PayPal from '../../PayPal/PayPal.js'
import Notiflix from 'notiflix';

import usePaymentResult from '../../../API/PayPal/usePaymentResult.js'
import DeliveryRadioGroup from '../../DeliveryRadioGroup/DeliveryRadioGroup.js'

function BidLot({ bid }) {
    const history = useHistory();

    const [paymentResult, result, isLoading, error] = usePaymentResult();

    const [delivery, setDelivery] = useState({});

    const [isPayed, setIsPayed] = useState(false);

    const [ttl, setTtl] = useState((new Date(bid.lot.timeTillEnd) - new Date()) / 1000 > 0 ? (new Date(bid.lot.timeTillEnd) - new Date()) / 1000 : 0);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (ttl > 0)
            setTimeout(() => {
                setTtl(ttl - 1);
            }, 1000);
    }, [ttl]);

    const onCheckout = async (e) => {
        e.preventDefault();

        //bla bla bla
    }

    useEffect(() => {
        if (isPayed === 'success') {
            paymentResult(isPayed, bid.lot.id, delivery);

            Notiflix.Notify.success('Оплата успішна')

            setModalVisible(false);
        }

        if (isPayed === 'error')
            Notiflix.Notify.failure('Оплата не успішна! Спробуйте ще раз')

    }, [isPayed])

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

                {ttl > 0  && bid.lot.isWaitingDelivery ?
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
                                <use href={`${svg}#attach_money`} />
                            </svg>
                            {bid.maxBidAmount}
                        </p>
                        <p>
                            <svg>
                                <use href={`${svg}#schedule`} />
                            </svg>
                            {formatTime(ttl)}
                        </p>
                        <p>
                            <svg>
                                <use href={`${svg}#location`} />
                            </svg>
                            {`м. ${bid.lot.city ? bid.lot.city : "Місто"}`}
                        </p>
                    </div>
                    {bid.lot.isWaitingPayment ?
                        <Button onClick={() => setModalVisible(true)}> Оформити лот</Button> :
                        <></>
                    }

                    {bid.lot.isWaitingDelivery ?
                        <Button className={css.waitDel}> Очікуйте доставки</Button> :
                        <></>
                    }

                    <NavLink to={"/lot/" + bid.lot.id} className={css.arrowOutward}>
                        <svg>
                            <use href={`${svg}#arrow_outward`} />
                        </svg>
                    </NavLink>
                </div>



            </div>

            <ModalWindow visible={modalVisible} setVisible={setModalVisible}>
                <h3>Оформити лот</h3>
                <form onSubmit={onCheckout}>
                    <div className={css.formDiv} id="data">
                        <h4>Ваші контактні дані</h4>
                        <div className={css.data}>
                            <div className={css.text}>
                                <svg>
                                    <use href={`${svg}#avatar`} />
                                </svg>
                                {`${bid.bidProfile.firstName} ${bid.bidProfile.lastName}`}
                            </div>

                            <div className={css.btn} onClick={() => history.push('/profile')}>Змінити</div>
                        </div>

                        <div className={css.data}>
                            <div className={css.text}>
                                <svg>
                                    <use href={`${svg}#phone`} />
                                </svg>
                                {`${bid.bidProfile.phone}`}
                            </div>

                            <div className={css.btn} onClick={() => history.push('/profile')}>Змінити</div>
                        </div>
                    </div>

                    <div className={css.formDiv} id="order">
                        <h4>Замовлення</h4>
                        <div className={css.data}>
                            <div className={css.text2}>
                                <img src={bid.lot.imageURLs ? bid.lot.imageURLs[0] : 'defaultImagePath.jpg'} className={css.img} alt="image" />
                                {bid.lot.title}
                            </div>

                            <div className={css.text} >{`${bid.maxBidAmount} грн`}</div>
                        </div>
                    </div>

                    <div className={css.formDiv} id="delivery">
                        <h4>Доставка</h4>
                        <DeliveryRadioGroup onDeliveryChange={(delivery) => setDelivery(delivery)} />

                    </div>

                    <div className={css.formDiv} id="payment">
                        <h4>Оплата</h4>
                        {!isPayed && delivery.index ?
                            <PayPal amount={bid.maxBidAmount} lot={bid.lot} setPayment={(status) => setIsPayed(status)} />
                            : "Оберіть адресу доставки)"
                        }
                    </div>
                </form>
            </ModalWindow>
        </div >

    );
}


export default BidLot;
