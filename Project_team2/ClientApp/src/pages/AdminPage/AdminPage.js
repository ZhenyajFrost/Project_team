import React, { useEffect, useState } from "react";
import LotContainer from "../../components/UI/LotContainer/LotContainer";
import useGetUnapprovedLots from "../../API/Lots/Get/useGetUnapprovedLots";
import { getLocalStorage } from "../../utils/localStorage";

export default function AdminPage() {
  const [getLots, lots, isLoading, error] = useGetUnapprovedLots();
  const token = getLocalStorage('token');
  //const lots = [{id: 1, isApproved: false}, {id: 2, isApproved: false}, {id: 3, isApproved: false}, {id: 4, isApproved: false}, {id: 5, isApproved: false}];
  //lots logic

  useEffect(async() => {
    await getLots(token);
  }, [])

  return (
    <div>
      <LotContainer lots={lots} display="list" lotStyle="basic" isAdmin="true" />
      {/* TO DO Pagination */}
    </div>
  );
}
