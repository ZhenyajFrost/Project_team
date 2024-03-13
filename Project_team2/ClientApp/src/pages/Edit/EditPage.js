import React, { useEffect } from "react";
import CreateLot from "../CreateLot";
import useGetLotById from "../../API/Lots/Get/useGetLotById";
import Loader from "../../components/Loader/Loader";

function EditPage(props) {
  const [getLotById, lot, isLoading, error] = useGetLotById();
  const id = parseInt(window.location.href.split("/").pop(), 10);
  useEffect(() => {
    if (lot.id !== id && !error) getLotById(id);
  }, [lot, getLotById, id]);
  const format =(lot)=>{
    return {...lot, }
  }
  if (!lot.id) {
    if(!error)
      return <Loader />;
    return <h1>Щось не гаразд</h1>
  }
  return (
    <div>
      <CreateLot data={lot} />
    </div>
  );
}

export default EditPage;
