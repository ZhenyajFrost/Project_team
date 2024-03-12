import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import LotPage from "./pages/LotPage.js";
import CreateLot from "./pages/CreateLot.js";
import "./custom.css";
import SearchPage from "./pages/Search/SearchPage.js";
import ProfileLots from "./pages/Profile/Lots/Lots.js";
import ProfileSettings from "./pages/Profile/Settings/Settings.js";
import ProfileLikedLots from "./pages/Profile/LikedLots.js";
import EditPage from "./pages/Edit/EditPage.js"

import ProfileLayout from "./pages/Profile/ProfileLayout.js";
import RestrictedPath from "./components/RestrictedPath/RestrictedPath.js";
import { getLocalStorage } from "./utils/localStorage.js";
import AdminPage from "./pages/AdminPage/AdminPage.js";
import { HowItWorks as HowItWorksPage } from "./pages/HowItWorks/HowItWorks.js";

export default class App extends Component {
  static displayName = App.name;
  render() {
    const user = getLocalStorage("user");

    return (
      <Layout>
        <Switch>
          <Route path="/lot/:id" component={LotPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/howItWorks" component={HowItWorksPage}/>
          <RestrictedPath
            path="/admin"
            component={AdminPage}
            fallback={{
              pathname: "",
              search: "?modal=login",
            }}
            condition={user && user.login && user.isAdmin}
          />
          <RestrictedPath
            path="/create"
            component={CreateLot}
            fallback={{
              pathname: "",
              search: "?modal=login",
            }}
            condition={user && user.login}
          />
          <RestrictedPath
            path="/edit/:id"
            component={EditPage}
            fallback={{
              pathname: "",
              search: "?modal=login",
            }}
            condition={user && user.login}
          />

          <Route exact path="/" component={Home} />
          <Route
            path="/profile"
            render={({ match: { url } }) => (
              <ProfileLayout>
                <Switch>
                  <Route path={`${url}/`} component={ProfileSettings} exact />
                  <Route path={`${url}/lots`} component={ProfileLots} />
                  <Route path={`${url}/settings`} component={ProfileSettings} />
                  <Route
                    path={`${url}/favorites`}
                    component={ProfileLikedLots}
                  />
                </Switch>
              </ProfileLayout>
            )}
          />
        </Switch>
      </Layout>
    );
  }
}
