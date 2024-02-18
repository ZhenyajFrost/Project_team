import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { Dropdown } from 'react-bootstrap';
import './NavMenu.css';
import logo from './images/logo.svg';
import cart from './images/cart.svg';
import catalog from './images/catalog.svg';
import profile from './images/profile.svg';
import ukraineFlag from './images/ukraineFlag.svg';
import arrow from './images/arrow.svg';
import ModalWindow from '../../ModalWindow/ModalWindow';
import Login from '../../Login/Login.js';
import LoginForgotPassword from '../../Login/LoginForgotPassword.js';
import Registration from '../../Registration/Registration.js';
import RegistrationConfirm from '../../Registration/RegistrationConfirm.js';
import { setLocalStorage, getLocalStorage, clearLocalStorage } from '../../../utils/localStorage.js';

function NavMenu() {
  const history = useHistory();

  const [modalLogVisible, setModalLogVisible] = useState(false);
  const [modalRegVisible, setModalRegVisible] = useState(false);
  const [forgotPass, setForgotPass] = useState(false);

  const [emailSent, setEmailSent] = useState(false);

  const [user, setUser] = useState("");

  const [isLoggined, setIsLoggined] = useState(false);
  const [userToken, setUserToken] = useState('');

  useEffect(() => {
    setIsLoggined(getLocalStorage('isLoggined'));
    setUserToken(getLocalStorage('token'));
    setUser(getLocalStorage('user'));

    console.log("isLoggined: " + isLoggined);
    console.log("user: " + user);
    console.log("token: " + userToken);
  }, []);

  const onExit = () => {
    clearLocalStorage({
      isLoggined: 'isLoggined',
      user: 'user',
      token: 'token'
    }, {
      isLoggined: false,
      user: {},
      token: ''
    });

    setIsLoggined(false);
    setUser({});
    setUserToken('');

    history.push('/');
  }

  return (
    <header>
      <Navbar expand="lg">
        <Container>
          <Navbar.Brand href='/'>
            <img src={logo} alt="logo" /> Exestic
          </Navbar.Brand>
          <Nav className='me-auto'>
            <Nav.Link href='search'>
              <img src={catalog} alt="catalog" /> Каталог
            </Nav.Link>
          </Nav>
          <Nav className='nav-right'>
            <Nav.Item className='country'>
              <img src={ukraineFlag} alt="Ukraine flag" /> UA <img src={arrow} alt="arrow" />
            </Nav.Item>
            <Dropdown alignRight>
              <Dropdown.Toggle as="a" bsPrefix="p-0" style={{ boxShadow: 'none' }}>
                <img src={profile} alt="Profile" />
              </Dropdown.Toggle>

              {isLoggined ?
                (<Dropdown.Menu>
                  <Dropdown.Item onClick={() => history.push('/profile')}>Мої Вподобання</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/profile')}>Мої ставки</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/profile')}>Оголошення</Dropdown.Item>
                  <Dropdown.Item onClick={() => history.push('/profile')}>Налаштування</Dropdown.Item>
                  <Dropdown.Item onClick={() => { onExit(); history.push('/'); }} style={{color: "red"}}>Exit</Dropdown.Item>
                </Dropdown.Menu>) :
                (<Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalLogVisible(true)}>Login</Dropdown.Item>
                  <Dropdown.Item onClick={() => setModalRegVisible(true)}>Registration</Dropdown.Item>
                </Dropdown.Menu>)
              }
            </Dropdown>
            <Nav.Item>
              <img src={cart} alt="Cart" />
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>

      <ModalWindow visible={modalLogVisible} setVisible={setModalLogVisible}>
        {forgotPass ?
          <LoginForgotPassword setForgotPass={setForgotPass} /> :
          <Login setModalVisible={setModalLogVisible} setModalRegVisible={setModalRegVisible} setForgotPass={setForgotPass} setIsLoggined={setIsLoggined}/>
        }
      </ModalWindow>

      <ModalWindow visible={modalRegVisible} setVisible={setModalRegVisible}>
        {emailSent ?
          <RegistrationConfirm user={user} setUser={setUser} setModalVisible={setModalRegVisible} setModalLogVisible={setModalLogVisible} setEmailSent={setEmailSent} /> :
          <Registration user={user} setModalVisible={setModalRegVisible} setModalLogVisible={setModalLogVisible} setUser={setUser} setEmailSent={setEmailSent} />
        }
      </ModalWindow>
    </header>
  );
}

export default NavMenu;