import React, { useState } from 'react'

function LotChange({ lot, setLot, kms }) {
    if(lot){
        return (
            <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                setLot({ title: form["title"], price:form["price"], timeTillEnd:form["time"], imageURL:form["img"] })
                kms()
            }}>
                <input defaultValue={lot.imageURL} name='img'/>
    
                <input defaultValue={lot.title} name='title'/>
                <input defaultValue={lot.price} name='price'/>
                <input defaultValue={lot.timeTillEnd} name='time'/>
                <button type='submit'>Ready</button>
            </form>
    
        )
    }
    return null

}


export default LotChange;