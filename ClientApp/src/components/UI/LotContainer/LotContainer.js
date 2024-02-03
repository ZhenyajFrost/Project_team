import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import Lot from "../../Lot/Lot.js";
import ModalWindow from "../../ModalWindow/ModalWindow.js";
import LotChange from "../../LotChange/LotChange.js";
import Button from "../Button/Button.js";
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



        {/* <ModalWindow visible={selectedId >= 0} setVisible={setSelectedId}>
          <LotChange
            lot={lots[selectedId]}
            setLot={(data) =>
              setLots([...lots.filter((_, i) => i !== selectedId), data])
            }
            kms={() => setSelectedId(-1)}
          />
          <Button onClick={() => setSelectedId(-1)}>Modal Window Close</Button>
        </ModalWindow> */}