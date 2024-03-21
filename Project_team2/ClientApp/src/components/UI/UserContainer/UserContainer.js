import React from "react";
import classes from "./UserContainer.module.css";
import UserShortV2 from "../../UserShort/UserShortV2/UserShortV2.js";

function UserContainer({ users, display = "", userStyle = "basic" }) {
    const displayClass = display ? classes[display] : '';
    const classString = `${classes.userContainer} ${displayClass}`;

    const renderLot = (user, style) => {
        switch (style) {
            case "basic":
                return (
                    <UserShortV2
                        user={user}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={classString}>
            {users.map((user) => renderLot(user, userStyle))}
        </div>
    );
}

export default UserContainer;
