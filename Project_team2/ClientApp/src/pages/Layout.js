import React, { Component } from "react";
import { Container } from "reactstrap";
import NavMenu from "../components/UI/NavMenu/NavMenu";
import Footer from "../components/UI/Footer/Footer";
import css from "./Layout.module.css";

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div className={css.container1}>
        <NavMenu />
        <Container>{this.props.children}</Container>
        <Footer />
      </div>
    );
  }
}
