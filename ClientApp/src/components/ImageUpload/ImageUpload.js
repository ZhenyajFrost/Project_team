import React, { useState, useRef, useEffect } from 'react';
import Button from '../UI/Button/Button';
import css from "./ImageUpload.module.css"

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // State to hold the preview URL

  const inputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    console.log(selectedFile)

  };

  useEffect(() => {
    console.log(selectedFile)

    setFile(selectedFile);
    if (selectedFile) {
      const filePreviewUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(filePreviewUrl); // Set the preview URL for the selected file
    }

  }, [selectedFile])

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const onDelete = () => {
    setSelectedFile(null);
    setPreviewUrl(null)
  }

  const onFileUpload = async () => {
    const cloudName = "ebayclone"; // Your Cloudinary cloud name
    const uploadPreset = "avatar"; // Your upload preset for unsigned uploads

    const formData = new FormData();
    formData.append("file", file); // Cloudinary expects the file in a field named "file"
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }

      const data = await response.json();
      console.log(data.url);
      alert("Image uploaded successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className={css.containerB}>
      <div className={css.container}>
        <div className={css.image}>{!selectedFile && "Your logo"}{selectedFile && <img src={previewUrl} className={css.image} />}</div>

        <input
          ref={inputRef}
          type="file"
          onChange={onFileChange}
          style={{ display: "none" }}
        />

        {/* Button to trigger the file input dialog */}
        <Button className="file-btn" onClick={onChooseFile}> Завантажити нове зображення</Button>
        {selectedFile && (
          <Button onClick={onDelete} className={css.delete}>Видалити</Button>
        )}
      </div>
      <Button onClick={onFileUpload}>Зберегти</Button>
    </div>
  );
}

export default ImageUpload;