import React, { useState } from "react";
import { useEffect } from "react";
import svg from "../../../images/svgDef.svg";
import { NavLink } from "react-router-dom";
import { formatTime } from "../../../utils/formatTime";
import css from "./LotSmall.module.css"
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import useDeleteLot from "../../../API/Lots/useDeleteLot";
import { getLocalStorage } from "../../../utils/localStorage";
import useUnactiveLot from "../../../API/Lots/Status/useUnactiveLot";
import useArchiveLot from "../../../API/Lots/Status/useArchiveLot";
import useUpdateLot from '../../../API/Lots/useUpdateLot';

function LotSmall({
  id,
  title,
  price,
  shortDescription,
  timeTillEnd,
  imageURLs,
  location,
  userId,
  status,
}) {
  const history = useHistory();
  const token = getLocalStorage('token');

  const [ttl, setTtl] = useState((new Date(timeTillEnd) - new Date()) / 10000);
  const { deleteLot, isLoading, error } = useDeleteLot();

  const [unactiveLot, isLoadingUn, errorUn] = useUnactiveLot();
  const [archiveLot, isLoadingAr, errorAr] = useArchiveLot();
  const {updateLot, isLoadingAc, errorAc} = useUpdateLot();


  useEffect(() => {
    setTimeout(() => {
      setTtl(ttl - 1);
    }, 1000);
  }, [ttl]);
  const [dots, setDots] = useState(false);
  const [thing, setThing] = useState(false);
  return (
    <div className={css.lot} onMouseEnter={() => setDots(Number(userId) === Number(getLocalStorage("user").id))} onMouseLeave={() => setDots(false)}>
      {dots ? (
        <div className={css.dots} onClick={() => setThing(!thing)}>
          <svg>
            <use href={`${svg}#dots_vertical`} />
          </svg>
          {thing ? (
            <div className={css.thing}>
              <p>
                <NavLink to={`/edit/${id}`}>Редагувати</NavLink>
              </p>
              {status === 'unactive' ?
                <>
                  <p onClick={() => archiveLot(token, id)}>Перемістити в архів</p>
                  <p onClick={() => updateLot(id, {})}>Перемістити в активні</p>
                </> :
                <></>
              }

              {status === 'active' ?
                <>
                  <p onClick={() => archiveLot(token, id)}>Перемістити в архів</p>
                  <p onClick={() => unactiveLot(token, id)}>Перемістити в неактивні</p>
                </> :
                <></>
              }

              {status === 'archive' ?
                <>
                  <p onClick={() => updateLot(id)}>Перемістити в активні</p>
                </> :
                <></>
              }

              <hr />
              <p
                className={css.delete}
                onClick={() => {
                  if (window.confirm("Ви точно хочете видалити " + title))
                    deleteLot(id);
                }}
              >
                Видалити
              </p>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
      <img
        src={
          imageURLs[0]
        }
        className={css.image}
        alt="oleg"
        onClick={() => history.push(`/lot/${id}`)}
      />
      <div className={css.info} onClick={() => history.push(`/lot/${id}`)}>
        <div className={css.title}>{title}</div>
        <div className={css.desc}>{shortDescription}</div>
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
            {price}
          </div>
          <div className={css.text}>
            <svg >
              <use href={`${svg}#location`} />
            </svg>
            {location ?  `м. ${location}` : "Location"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LotSmall;
