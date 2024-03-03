import React from "react";
import { Route } from "react-router";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

function RestrictedPath({ path, component, fallback, condition }) {
  //СТас, не забудь, що ти це поламав ждодавши тру на 7 рядку, бо в тебе не приходить код на пошту. дякую
  if (condition)
    return (
      <Route path={path} component={component} />
    );
    else
    return <Redirect to={fallback} />
}

export default RestrictedPath;
