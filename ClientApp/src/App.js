import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home';
import LotPage from "./pages/LotPage.js";
import CreateLot from "./pages/CreateLot.js";
import './custom.css';
import SearchPage from './pages/SearchPage.js';
import ProfileLots from './pages/Profile/Lots.js';
import ProfileSettings from './pages/Profile/Settings.js';
import ProfileLayout from './pages/Profile/ProfileLayout.js'; 

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <Switch>
                    <Route path='/lot/:id' component={LotPage} />
                    <Route path='/search' component={SearchPage} />
                    <Route exact path='/create' component={CreateLot} />
                    <Route exact path='/' component={Home} />
                    <Route path='/profile' render={({ match: { url } }) => (
                        <ProfileLayout>
                            <Switch>
                                <Route path={`${url}/`} component={ProfileSettings} exact />
                                <Route path={`${url}/lots`} component={ProfileLots} />
                                <Route path={`${url}/settings`} component={ProfileSettings} />
                            </Switch>
                        </ProfileLayout>
                    )} />
                </Switch>
            </Layout>
        );
    }
}
