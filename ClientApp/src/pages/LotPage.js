import React, { useState } from "react";
import PostService from "../API/PostService";
import ImageGallery from "react-image-gallery";
import "../styles/Home.css";
import Loader from "../components/Loader/Loader";
import LotPath from "../components/LotPath/LotPath";
import PictureCarousel from "../components/PictureCarousel/PictureCarousel";
function LotPage() {
  const id =
    window.location.href.split("/")[window.location.href.split("/").length - 1];
  console.log(id);
  const [lot, setLot] = useState({
    id: "",
    title: null,
    price: 0,
    timeTillEnd: 0,
    hot: false,
  });
  useState(async () => {
    let res = await PostService.getById(id);
    console.log(res);
    setLot(res);
  }, [setLot]);
  console.log(lot.title);
  return (
    <div>
      <LotPath category={lot.category} name={lot.title}/>
      <PictureCarousel images={["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJh3CWYgD6Ef_xBzfGGAPLgyHxxi_vNEto993EyZITNQ&s", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_yoXVqQfcb5B9P1nv3tJUs1PBZ520YK0nYARL81kt9w&s", "https://picsum.photos/200/300", "https://picsum.photos/200", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwik-MjBNo1c_YNUECZyXvMBEZ94-_Y7o2X1Xmbx5LWA&s"]}/>
    </div>
  );
}

export default LotPage;
