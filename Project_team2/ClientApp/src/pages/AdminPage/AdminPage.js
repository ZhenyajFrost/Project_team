import React, { useEffect, useState } from "react";
import LotContainer from "../../components/UI/LotContainer/LotContainer";
import useGetUnapprovedLots from "../../API/Lots/Get/useGetUnapprovedLots";
import { getLocalStorage } from "../../utils/localStorage";
import Loader from "../../components/Loader/Loader";

export default function AdminPage() {
  const [getLots, lots, isLoading, error] = useGetUnapprovedLots();
  const token = getLocalStorage('token');

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
