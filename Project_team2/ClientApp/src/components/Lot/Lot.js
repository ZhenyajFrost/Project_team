﻿import React, { useState } from "react";
import { useEffect } from "react";
import css from "./Lot.module.css";
import MoneySvg from "../../images/svgDef.svg";
import { NavLink } from "react-router-dom";
import { formatTime } from "../../utils/formatTime";
import Button from '../UI/Button/Button';
import ModalWindow from '../ModalWindow/ModalWindow.js'
import useApproveLot from "../../API/Lots/useApproveLot.js";
import useDenyLot from "../../API/Lots/useDenyLot.js";
import { getLocalStorage } from "../../utils/localStorage.js";

function Lot({
  id,
  title,
  price,
  shortDescription,
  category,
  timeTillEnd,
  hot,
  imageURLs,
  openModal,
  isAdmin,
  isApproved
}) {
  const [ttl, setTtl] = useState((new Date(timeTillEnd) - new Date())/10000);

  const token = getLocalStorage('token');

  const [modalVisible, setModalVisible] = useState(false)
  const [explanation, setExplanation] = useState("");
  const _isApproved = isApproved === undefined ? true : isApproved;

  const [approveLot, isLoading, error] = useApproveLot();
  const [denyLot, isLoadingDeny, errorDen] = useDenyLot();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (ttl > 0)
      setTimeout(() => {
        setTtl(ttl - 1);
      }, 1000);
  }, [ttl]);

  const handleSendClick = async () => {
    const data = {
      token: token,
      lotId: id,
      explanation: `${explanation} \tЛот переведено до Архіву`
    }

    await denyLot(data);
    setIsChecked(true);

    console.log(`Send data: id ${data.lotId} explanation ${data.explanation}`) //TO SERVER 
  }

  const handleApproveClick = async () => {
    await approveLot(id, token);

    if (!error)
      setIsChecked(true);

    console.log(`Lot ${id} applroved`); //LOGIC TO SERVER
  }

  return (
    <div className={`${css.lot} ${ttl > 0 ? css.active : css.inactive} ${isChecked ? css.checked : ""}`}>
      <img
        src={
          imageURLs[0]
        }
        className={css.lotImage}
        alt="oleg"
      />
      <div className={css.lotText}>
        <h3 className={`${css.lotTitle}`}>{title}</h3>
        <p className={css.lotDesc}>{shortDescription}</p>

        <div className={css.lotInfo}>
          <p>
            <svg>
              <use href={`${MoneySvg}#attach_money`} />
            </svg>
            {price}
          </p>
          <p>
            <svg>
              <use href={`${MoneySvg}#schedule`} />
            </svg>
            {formatTime(ttl)}
          </p>
          <NavLink to={"/lot/" + id} className={css.arrowOutward}>
            <svg>
              <use href={`${MoneySvg}#arrow_outward`} />
            </svg>
          </NavLink>
        </div>
      </div>
      {isAdmin && !_isApproved ?
        <div className={css.adminPanel}>
          <Button className={css.approve} onClick={handleApproveClick}>Approve</Button>
          <Button className={css.deny} onClick={() => setModalVisible(true)}>Deny</Button>
        </div> : <></>}

      <ModalWindow visible={modalVisible} setVisible={setModalVisible}>
        <h2>Explanation</h2>
        <textarea
          className={css.explanation}
          placeholder="Write explanation why lot is denied"
          value={explanation}
          onInput={(e) => setExplanation(e.target.value)}
        />
        <Button onClick={handleSendClick}>Send reply</Button>
      </ModalWindow>
    </div>

  );
}

export default Lot;
