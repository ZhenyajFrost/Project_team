import React, { useEffect, useState } from "react";
import css from './Report.module.css'
import useReportLot from "../../API/Lots/useReportLot.js";
import Input from "../UI/Input/Input.js";
import Button from "../UI/Button/Button.js";

function Report({ lotId }) {

    const [reportLot, isLoading, error] = useReportLot();
    const [desc, setDesc] = useState();

    const handleReport = async () =>{
        await reportLot(lotId, desc);
    }


    return (
        <div>
            <div className={css.title}>
                {isLoading ? "Loading..." : `Скарка на лот ${lotId}`}
            </div>
            <div className={css.desc}>
                <Input
                placeholder="Введіть причину скарги"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
            </div>
            <Button onClick={handleReport}>Надіслати</Button>
        </div>
    );
}

export default Report;
