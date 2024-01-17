import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home';
import LotPage from "./pages/LotPage.js"

import './custom.css'

export default class App extends Component {
    static displayName = App.name;

  render () {
    return (
        <Layout>
         <Route path='/lot/:id' component={LotPage} />

        <Route exact path='/' component={Home} />
      </Layout>
    );
    }
}
