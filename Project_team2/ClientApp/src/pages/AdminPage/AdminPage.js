import React, { useEffect, useState } from "react";
import LotContainer from "../../components/UI/LotContainer/LotContainer";

export default function AdminPage() {
    const lots = [{id: 1, isApproved: false}, {id: 2, isApproved: false}, {id: 3, isApproved: false}, {id: 4, isApproved: false}, {id: 5, isApproved: false}];
    //lots logic

  return (
    <div>
        <LotContainer lots={lots} display="list" lotStyle="basic" isAdmin="true"/> 
        {/* TO DO Pagination */}
    </div>
  );
}
