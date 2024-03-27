import React, { useEffect, useState } from "react";
import css from "./Report.module.css";
import useReportLot from "../../API/Lots/useReportLot.js";
import Input from "../UI/Input/Input.js";
import Button from "../UI/Button/Button.js";
import reports from "../../Data/reports.json";

function Report({ lotId, setVisible }) {
  const [reportLot, isLoading, error] = useReportLot();
  const [cat, setCat] = useState();
  const [desc, setDesc] = useState();

  const handleReport = async () => {
    await reportLot(lotId, `Тема:${cat} Текст:${desc}`);
    setVisible(false);
  };

  return (
    <div>
      <div className={css.title}>
        {isLoading ? "Loading..." : `Скарка на лот ${lotId}`}
      </div>
      <div className={css.lotCat}>
        {reports.map((v, i) => (
          <>
            <p
              key={v}
              onClick={() => setCat(v)}
              className={cat === v ? css.tick : null}
            >
              {v}
            </p>
            {i + 1 < reports.length ? <hr /> : null}
          </>
        ))}
      </div>
      {cat ? (
        <div className={css.desc}>
          <p>Поясніть, із чим виникла проблема</p>
          <textarea
            placeholder="Введіть причину скарги"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className={css.inp}
          />
        </div>
      ) : null}
      <p style={{ textAlign: "center" }}>
        Надсилаючи цю скаргу, ви підтверджуєте, що дієте добросовісно й що
        надана вами інформація є достовірною, наскільки вам відомо.
        <div style={{marginTop:"10px"}}>{desc ? <Button onClick={handleReport} style={{width:"100%"}}>Відправити скаргу</Button> : null}</div>
      </p>
    </div>
  );
}

export default Report;
