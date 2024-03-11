import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { Dropdown } from "react-bootstrap";
import "./NavMenu.css";
import logo from "./images/logo.svg";
import catalog from "./images/catalog.svg";
import profile from "./images/profile.svg";
import ModalWindow from "../../ModalWindow/ModalWindow";
import Login from "../../Login/Login.js";
import LoginForgotPassword from "../../Login/LoginForgotPassword.js";
import Registration from "../../Registration/Registration.js";
import RegistrationConfirm from "../../Registration/RegistrationConfirm.js";
import {
  setLocalStorage,
  getLocalStorage,
  clearLocalStorage,
} from "../../../utils/localStorage.js";

function NavMenu() {
  const history = useHistory();

  const [modalLogVisible, setModalLogVisible] = useState(false);
  const [modalRegVisible, setModalRegVisible] = useState(false);
  const [forgotPass, setForgotPass] = useState(false);

  const [emailSent, setEmailSent] = useState(false);

  const [user, setUser] = useState(getLocalStorage('user'));
  const [isLoggined, setIsLoggined] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(getLocalStorage('token'));
    setUser(getLocalStorage('user'));
    setIsLoggined(getLocalStorage('isLoggined'));

    const modal = new URLSearchParams(window.location.search).get("modal");

    if (modal) {
      if (modal === "login") {
        setModalLogVisible(true);
      } else if (modal === "register") {
        setModalRegVisible(true);
      }
    }

    console.log("isLoggined: " + isLoggined);
    console.log("user: " + user);
    console.log("token: " + token);
  }, []);

  useEffect(() => {
    setToken(getLocalStorage("token"));
    setUser(getLocalStorage("user"));
  }, [isLoggined]);

  const onExit = () => {
    clearLocalStorage(
      {
        isLoggined: "isLoggined",
        user: "user",
        token: "token",
      },
      {
        isLoggined: false,
        user: {},
        token: "",
      }
      
    );

    setIsLoggined(false);
    setUser({});
    setToken("");

    history.push("/");
    window.location.reload();
  };

  return (
    <header>
      <Navbar expand="lg">
        <Container>
          <Navbar.Brand href="/">
            <img src={logo} alt="logo" /> Exestic
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="search">
              <img src={catalog} alt="catalog" /> Каталог
            </Nav.Link>
            {user.isAdmin ? 
            <Nav.Link href="admin">
              Admin
            </Nav.Link> : <></>}
          </Nav>
          <Nav className="nav-right">
            <Dropdown>
              <Dropdown.Toggle
                as="a"
                bsPrefix="p-0"
                style={{ boxShadow: "none" }}
              >
                <img src={profile} alt="Profile" />
              </Dropdown.Toggle>


              {isLoggined ?
                (<Dropdown.Menu align="end" >
                  <Dropdown.Item>
                    {user && <div className="nav-profile">
                      {user.avatar && <img src={user.avatar} class="avatar" />}
                      <div className="info">
                        <span className="login">{`${user.login}`}</span>
                        <span className="email">{`${user.email}`}</span>
                      </div>
                    </div>}

                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/profile/favorites')}>Мої Вподобання</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/profile')}>Мої ставки</Dropdown.Item>
                  <hr />
                  <Dropdown.Item onClick={() => history.push('/profile/lots')}>Оголошення</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/profile/settings')}>Налаштування</Dropdown.Item>
                  <hr />
                  <Dropdown.Item onClick={() => { onExit(); history.push('/'); }} style={{ color: "red" }}>Exit</Dropdown.Item>
                </Dropdown.Menu>) :
                (<Dropdown.Menu align="end" >
                  <Dropdown.Item onClick={() => setModalLogVisible(true)}>Login</Dropdown.Item>
                  <Dropdown.Item onClick={() => setModalRegVisible(true)}>Registration</Dropdown.Item>
                </Dropdown.Menu>)
              }

            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      <ModalWindow visible={modalLogVisible} setVisible={setModalLogVisible}>
        {forgotPass ? (
          <LoginForgotPassword setForgotPass={setForgotPass} />
        ) : (
          <Login
            setModalVisible={setModalLogVisible}
            setModalRegVisible={setModalRegVisible}
            setForgotPass={setForgotPass}
            setIsLoggined={setIsLoggined}
          />
        )}
      </ModalWindow>

      <ModalWindow visible={modalRegVisible} setVisible={setModalRegVisible}>
        {emailSent ? (
          <RegistrationConfirm
            user={user}
            setUser={setUser}
            setModalVisible={setModalRegVisible}
            setModalLogVisible={setModalLogVisible}
            setEmailSent={setEmailSent}
          />
        ) : (
          <Registration
            user={user}
            setModalVisible={setModalRegVisible}
            setModalLogVisible={setModalLogVisible}
            setUser={setUser}
            setEmailSent={setEmailSent}
          />
        )}
      </ModalWindow>
    </header>
  );
}

export default NavMenu;
