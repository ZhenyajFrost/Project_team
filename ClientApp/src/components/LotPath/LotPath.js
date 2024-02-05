import React from "react";
import svg from "../../images/svgDef.svg";
import { NavLink } from "react-bootstrap";
import css from "./style.module.css"

function LotPath({ category, name }) {
  return (
    <div className={css.path}>
      <NavLink href="/">
        <svg>
          <use href={`${svg}#home`} />
        </svg>
        Products
      </NavLink>
      <svg>
        <use href={`${svg}#arrow-right`} />
      </svg>
      <NavLink href="*">{category}</NavLink>
      <svg>
        <use href={`${svg}#arrow-right`} />
      </svg>
      <NavLink href="">{name}</NavLink>
    </div>
  );
}

export default LotPath;
