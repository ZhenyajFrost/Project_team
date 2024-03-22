import React, { useEffect, useState } from "react";
import LotContainer from "../../components/UI/LotContainer/LotContainer";
import useGetUnapprovedLots from "../../API/Lots/Get/useGetUnapprovedLots";
import { getLocalStorage } from "../../utils/localStorage";
import Loader from "../../components/Loader/Loader";
import WebSocketComponent from "../../WebSockets/WebSocketComponent";

export default function AdminPage() {
  const [getLots, lots, isLoading, error] = useGetUnapprovedLots();
  const token = getLocalStorage('token');

  useEffect(async() => {
    await getLots(token);
  }, [])

  return (
    <div>
      <WebSocketComponent />
      {isLoading ? <Loader/> : <LotContainer lots={lots} display="list" lotStyle="basic" isAdmin="true" />}
      {/* TO DO Pagination */}
    </div>
  );
}
