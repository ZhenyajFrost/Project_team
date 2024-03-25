import React, { useState } from "react";
import css from "./style.module.css";
import { Buffer } from "buffer";
import { Notify } from "notiflix";

function PhotoItem({ photo, setPhoto, order, kms }) {
  let disp;
  const [drag, setDrag] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [positionStart, setPositionStart] = useState({ top: 0, left: 0 });
  const addPhoto = (e) => {
    e.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = e.target.files[0];

      const cloudName = "ebayclone";
      const formData = new FormData();
      formData.append("upload_preset", "lotPhoto");
      formData.append("file", file);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("HTTP error! status: " + response.status);
        }

        const data = await response.json();

        setPhoto(data.secure_url);
        Notify.success("Зображення завантажено успішно!");
      } catch (error) {
        Notify.failure("Щось пішло не так");
      }
    };
    input.click();
  };

  if (photo) {
    if (photo === "+")
      disp = (
        <button type="sex" onClick={addPhoto}>
          Додати
        </button>
      );
    else disp = <img src={photo} alt="item" draggable="false" />;
  } else {
    disp = <p></p>;
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
          if (!e.target.className.includes("cross") && photo && photo !== "+") {
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
        {photo && photo !== "+" ? <div className={css.cross} onClick={kms}>x</div> : null}
      </div>
    );
  }
}

export default PhotoItem;
