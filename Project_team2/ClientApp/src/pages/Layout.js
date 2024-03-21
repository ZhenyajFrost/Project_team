import React, { Component } from "react";
import { Container } from "reactstrap";
import NavMenu from "../components/UI/NavMenu/NavMenu";
import Footer from "../components/UI/Footer/Footer";
import css from "./Layout.module.css";

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div className={css.main}>
        <NavMenu />
        <Container className={css.container1}>
          {this.props.children}
        </Container>
        <Footer style={{alignSelf: 'flex-end'}}/>
      </div>
    );
  }
}
