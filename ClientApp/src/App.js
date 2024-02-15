import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home';
import LotPage from "./pages/LotPage.js"
import CreateLot from "./pages/CreateLot.js"


import './custom.css'
import Profile from './pages/Profile.js';
import SearchPage from './pages/SearchPage.js';

export default class App extends Component {
    static displayName = App.name;

  render () {
    return (
        <Layout>
         <Route path='/lot/:id' component={LotPage} />
         <Route path='/profile' component={Profile} />
         <Route path='/search' component={SearchPage} />

        <Route exact path='/create' component={CreateLot} />
        <Route exact path='/' component={Home} />
      </Layout>
    );
    }
}
