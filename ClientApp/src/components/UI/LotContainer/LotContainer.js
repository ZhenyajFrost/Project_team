import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import Lot from "../../Lot/Lot.js";
import classes from "./LotContainer.module.css";

function LotContainer({ lots, display = "grid" }) {
  //const [selectedId, setSelectedId] = useState(-1);

  return (
    <div>
    
      <div className={classes.lotsContainer+" "+(display==="grid" ? classes.grid : classes.list)}>
        {lots.map((lot, i) => (
          <Lot
            id={lot.id}
            title={lot.title}
            price={lot.price}
            shortDescription={lot.shortDescription}
            category={lot.category}
            timeTillEnd={lot.timeTillEnd}
            hot={lot.hot}
            imageURL={lot.imageURL}
            //openModal={() => setSelectedId(i)}
          />
        ))}

      </div>
    </div>
  );
}

export default LotContainer;