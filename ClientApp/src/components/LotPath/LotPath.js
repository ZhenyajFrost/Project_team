import React from "react";
import svg from "../../images/svgDef.svg";
import { NavLink } from "react-bootstrap";
import css from "./style.module.css";

function LotPath({ path }) {
  return (
    <div className={css.path}>
      <NavLink href="/">
        <svg>
          <use href={`${svg}#home`} />
        </svg>
        Products
      </NavLink>

      {path.map((v) => (
        <>
          <svg>
            <use href={`${svg}#arrow-right`} />
          </svg>
          <NavLink href={v.path}>{v.name}</NavLink>
        </>
      ))}
    </div>
  );
}

export default LotPath;
