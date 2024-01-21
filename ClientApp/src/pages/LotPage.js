import React, { useState } from 'react'
import PostService from '../API/PostService';
import ImageGallery from "react-image-gallery";
import '../styles/Home.css'
function LotPage() {
    const id = window.location.href.split("/")[window.location.href.split("/").length - 1]; console.log(id);
    const [lot, setLot] = useState({ id: "", title: null, price: 0, timeTillEnd: 0, hot: false })
    useState(async () => {
        let res = await PostService.getById(id);
        console.log(res);
        setLot(res);
    }, [setLot])
    console.log(lot.title);
    if (lot.title) {
        return (
            <>
                <ImageGallery items={lot.images.map((v,i) => {
                    return {
                        original: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzj49rb70qayLcsE_g-Bl54iw3sMoJsZRfLbU-tQOqWQ&s",
                        thumbnail: "https://icarehealths.org/pages/potenboost/plp/Oiejw67Yhb/images/we.jpg"
                    }
                })}
                wrapperClass="wrapper"/>
                <h1>{lot.title}</h1>
                <p>Only for {lot.price}</p>
                <p>Over in <span className="time-left">{lot.timeTillEnd}</span></p>
                <form>
                    <button name='bet' value="10">+10$</button>
                    <button name='bet' value="50">+50$</button>
                    <button name='bet' value="100">+100$</button>
                    <input name='bet' type='number'/>
                </form>
            </>

        )
    } else {
        return (
            <h1>{id}</h1>
        )
    }

}


export default LotPage;