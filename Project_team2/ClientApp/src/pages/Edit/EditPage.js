import React, { useEffect } from "react";
import CreateLot from "../CreateLot";
import useGetLotById from "../../API/Lots/useGetLotById";
import Loader from "../../components/Loader/Loader";

function EditPage(props) {
  const [getLotById, lot, isLoading, error] = useGetLotById();
  const id = parseInt(window.location.href.split("/").pop(), 10);
  useEffect(() => {
    if (lot.id !== id) getLotById(id);
  }, [lot, getLotById, id]);
  const format =(lot)=>{
    return {...lot, }
  }
  if (!lot.id) {
    return <Loader />;
  }
  return (
    <div>
      <CreateLot data={lot} />
    </div>
  );
}

export default EditPage;
