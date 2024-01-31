import React, { Component } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import logo from './images/logo.svg';
import cart from './images/cart.svg';
import catalog from './images/catalog.svg';
import menu from './images/menu.svg';
import profile from './images/profile.svg';
import ukraineFlag from './images/ukraineFlag.svg';
import arrow from './images/arrow.svg';

export class NavMenu extends Component {
  static displayName = NavMenu.name;

  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {

    return (
      <header>
        {/* <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
           <Container>
            <NavbarBrand tag={Link} to="/">Project_team2</NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
              <ul className="navbar-nav flex-grow">
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/">Home</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/counter">Counter</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/profile">
                    <img className='avatar' src='https://www.heymind.org.uk/wp-content/uploads/2022/04/avatar-placeholder.png' />
                  </NavLink>
                </NavItem>
              </ul>
            </Collapse>
          </Container>
        </Navbar> */}
        <Navbar expand="lg">
          <Container>
            <Navbar.Brand href='/'>
              <img src={logo} />{" "}
              Exestic
            </Navbar.Brand>
            <Nav className='me-auto'>
                <Nav.Link >
                  <img src={catalog} />{" "}
                  Каталог
                </Nav.Link>
              </Nav>
              <Nav className='nav-right' pullRight>
                <Nav.Item className='country' style={{marginRight: 18 + 'px'}}>
                  <img src={ukraineFlag} />{" "}
                  UA {" "}
                  <img src={arrow} />
                </Nav.Item>
                <Nav.Link className='profile' style={{marginRight: 18 + 'px'}} href="/profile">
                  <img src={profile} />
                </Nav.Link>
                <Nav.Item>
                  <img src={cart}/>
                </Nav.Item>
              </Nav>
          </Container>
        </Navbar>
      </header>
    );
  }
}