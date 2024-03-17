import React from "react";
import classes from "./BidsContainer.module.css";
import BidLot from "../../Bid/BidLot/BidLot.js";

function BidsContainer({ bids, display = "", bidStyle = "basic", isAdmin = "false" }) {
    const displayClass = display ? classes[display] : '';
    const classString = `${classes.bidsContainer} ${displayClass}`;
    console.log("bids", bids)

    const renderBid = (bid, style) => {
        switch (style) {
            case "basic":
                return (
                    <BidLot
                        bid={bid}
                    />
                );
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
