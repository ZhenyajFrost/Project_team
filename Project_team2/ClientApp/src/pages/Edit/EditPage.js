import React, { useEffect } from "react";
import CreateLot from "../CreateLot";
import useGetLotById from "../../API/Lots/Get/useGetLotById";
import Loader from "../../components/Loader/Loader";
import { isEmptyObject } from "jquery";
import store from "../../utils/Zustand/store";

function EditPage(props) {
  const [getLotById, lot, isLoading, error] = useGetLotById();
  const id = parseInt(window.location.href.split("/").pop(), 10);
  const {token} = store();
  useEffect(() => {
    if (lot.id !== id && isEmptyObject(error)) getLotById(id, token);
  }, [lot, getLotById, id]);

  if (!lot.id) {
    if (!error) return <Loader />;
    return <h1>Щось не гаразд</h1>;
  }
  return (
    <div>
      <CreateLot data={lot} />
    </div>
  );
}

export default EditPage;
