import React, { useState } from 'react'

function LotPage() {
    const id = window.location.href.split("/")[window.location.href.split("/").length - 1];
    const [lot, setLot] = useState({id, title, price,timeTillEnd, hot})
    fetch("https://659d64ca633f9aee79095579.mockapi.io/lot/" + id).then(v => {
        setLot(v.json());
    })
    if (lot.title) {
        return (
            <>
                <h1>title</h1>
                <p>Only for {price}</p>    
            </>
            
        )
    } else {
        return (
            <h1>{id}</h1>
        )    
    }
    
}


export default Lot;