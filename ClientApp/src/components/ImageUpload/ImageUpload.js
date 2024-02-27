import React, { useState } from 'react';

const ImageUpload = () => {
  const [file, setFile] = useState(null); // Initialize state to null for clarity

  const onFileChange = (event) => {
    // Set the file to the one selected by the user
    setFile(event.target.files[0]);
  };

  const onFileUpload = async () => {
    const clientId = "YOUR_CLIENT_ID";
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("https://api.imgur.com/3/image/", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Client-ID ${clientId}`,
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Too many requests. Please try again later.');
            }
            throw new Error('HTTP error! status: ' + response.status);
        }

        const data = await response.json();
        console.log(data);
        alert("Image uploaded successfully.");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
};


  return (
    <>
      <input name="file" type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload</button>
    </>
  );
}

export default ImageUpload;
