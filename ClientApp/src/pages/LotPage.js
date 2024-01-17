import React, { useState } from 'react'

function LotPage() {
    const id = window.location.href.split("/")[window.location.href.split("/").length - 1]; console.log(id);
    const [lot, setLot] = useState({ id: "", title: null, price: 0, timeTillEnd: 0, hot: false })
    useState(() => {
        fetch("https://659d64ca633f9aee79095579.mockapi.io/lot/" + id).then(v => v.json()).then(data => {
            setLot(data);
        })
    }, [setLot])
    console.log(lot.title);
    if (lot.title) {
        return (
            <>
                <img src={lot.imageURL }/>
                <h1>{lot.title}</h1>
                <p>Only for {lot.price}</p>
                <p>Over in <span className="time-left">{lot.timeTillEnd}</span></p>
            </>
            
        )
    } else {
        return (
            <h1>{ id}</h1>
        )    
    }
    
}


export default LotPage;