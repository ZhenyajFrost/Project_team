import React, { useEffect, useState } from "react";
import LotContainer from "../../components/UI/LotContainer/LotContainer";
import useGetUnapprovedLots from "../../API/Lots/Get/useGetUnapprovedLots";
import store from "../../utils/Zustand/store";
import Loader from "../../components/Loader/Loader";
import WebSocketComponent from "../../WebSockets/WebSocketComponent";

export default function AdminPage() {
  const [getLots, lots, isLoading, error] = useGetUnapprovedLots();
 const {token} = store();

  useEffect(async() => {
    await getLots(token);
  }, [])

  return (
    <div>
      {isLoading ? <Loader/> : <LotContainer lots={lots} display="list" lotStyle="basic" isAdmin="true" />}
      {/* TO DO Pagination */}
    </div>
  );
}
