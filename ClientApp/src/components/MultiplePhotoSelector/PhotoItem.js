import React, { useState } from "react";
import css from "./style.module.css";
import { Buffer } from "buffer";

function PhotoItem({ photo, setPhoto, order }) {
  let disp;
  const [drag, setDrag] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [positionStart, setPositionStart] = useState({ top: 0, left: 0 });
  const addPhoto = () => {
    var input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      var file = e.target.files[0];

      // setting up the reader
      var reader = new FileReader();
      reader.readAsArrayBuffer(file);

      // here we tell the reader what to do when it's done reading...
      reader.onload = (readerEvent) => {
        var content = readerEvent.target.result; // this is the content!
        setPhoto(new Buffer.from(content).toString("base64"));
        console.log(content);
      };
    };
    input.click();
  };

  if (photo) {
    if (photo === "+") disp = <button onClick={addPhoto}>Додати</button>;
    else
      disp = (
        <img
          src={"data:image/png;base64," + photo}
          alt="item"
          draggable="false"
        />
      );
  }
  const move = (e) => {
    const left = e.clientX - e.target.width / 2;
    const top = e.clientY - e.target.height / 2;
    setPosition({
      top,
      left,
    });
  };
  if (drag) {
    return (
      <div className={css.item}>
        <div
          onMouseUp={(e) => {
            setDrag(false);
            const n = 0.7;
            let res = 0;
            if (
              position.left - positionStart.left > e.target.width * n ||
              position.left - positionStart.left < -e.target.width * n
            ) {
              res += Math.round(
                (position.left - positionStart.left) / (e.target.width * n)
              );
            }
            // console.log({pt:position.top, pst:positionStart.top, eh: e.target.height})
            if (
              position.top - positionStart.top > e.target.height ||
              position.top - positionStart.top < -e.target.height
            ) {
              res +=
                Math.round(
                  (position.top - positionStart.top) / e.target.height
                ) * 5;
            }

            order(res);
          }}
          onMouseMove={move}
          className={css.item + " " + css.dragable}
          style={{ top: position.top + "px", left: position.left + "px" }}
        >
          {disp}
        </div>
      </div>
    );
  } else {
    return (
      <div
        onMouseDown={(e) => {
          if (photo && photo !== "+") {
            setDrag(true);
            move(e);
            setPositionStart({
              left: e.clientX - e.target.width / 2,
              top: e.clientY - e.target.height / 2,
            });
          }
        }}
        className={css.item}
      >
        {disp}
      </div>
    );
  }
}

export default PhotoItem;
