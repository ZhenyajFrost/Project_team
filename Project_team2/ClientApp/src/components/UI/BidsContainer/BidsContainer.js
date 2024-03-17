import React from "react";
import classes from "./BidsContainer.module.css";
import BidLot from "../../Bid/BidLot/BidLot.js";
import BidLotSmall from "../../Bid/BidLotSmall/BidLotSmall.js";


function BidsContainer({ bids, display = "", bidStyle = "basic", isAdmin = "false" }) {
    const displayClass = display ? classes[display] : '';
    const classString = `${classes.bidsContainer} ${displayClass}`;

    const renderBid = (bid, style) => {
        switch (style) {
            case "basic":
                return (
                    <BidLot
                        bid={bid}
                    />
                );
                case "small" : 
                return (
                    <BidLotSmall bid={bid}/>
                )
            default:
                return null;
        }
    };

    return (
        <div className={classString}>
            {bids.map((bid) => 
                renderBid(bid, bidStyle)
                )}
        </div>
    );
}

export default BidsContainer;
