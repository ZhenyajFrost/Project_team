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
import CategoryContainer from "../../CategoryContainer/CategoryContainer.js";

function LotContainer({ lots, setLots }) {
  //const [selectedId, setSelectedId] = useState(-1);
  const [selectedCat, setSelectedCat] = useState("Холодильники");
  return (
    <div>
    <h2>Популярні лоти</h2>
    <CategoryContainer categories={["Холодильники","Іфон 13","Картини","Телевізор","Іграшки","Навушники","Колеса)"]} onCategoryChange={setSelectedCat} selectedCategorie={selectedCat}/>
    
      <div className={classes.lotsContainer}>
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