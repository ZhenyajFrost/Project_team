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
import ProfileLikedItems from "./pages/Profile/LikedItems.js";
import EditPage from "./pages/Edit/EditPage.js";

import ProfileLayout from "./pages/Profile/ProfileLayout.js";
import RestrictedPath from "./components/RestrictedPath/RestrictedPath.js";
import AdminPage from "./pages/AdminPage/AdminPage.js";
import { HowItWorks as HowItWorksPage } from "./pages/HowItWorks/HowItWorks.js";
import UserPage from "./pages/UserPage/UserPage.js";
import ProfileBids from "./pages/Profile/Bids/Bids.js";
import Page404 from "./pages/404/Page404.js";
import store from "./utils/Zustand/store.js";

const App =()=> {
  //static displayName = App.name;

    const {user, isLoggined}=store();

    return (
      <Layout>
        <Switch>
          <Route path="/lot/:id" component={LotPage} />
          <Route path='/404' component={Page404}/>
          <Route path="/user/:id" component={UserPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/howItWorks" component={HowItWorksPage} />
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
            condition={user && isLoggined}
          />
          <RestrictedPath
            path="/edit/:id"
            component={EditPage}
            fallback={{
              pathname: "",
              search: "?modal=login",
            }}
            condition={user && isLoggined}
          />

          <Route exact path="/" component={Home} />
          <Route
            path="/profile"
            render={({ match: { url } }) => (
              <ProfileLayout>
                <Switch>
                  <RestrictedPath
                    path={`${url}/bids`}
                    component={ProfileBids}
                    condition={isLoggined}
                    fallback={{
                      pathname: "",
                      search: "?modal=login",
                    }}

                  />
                  <RestrictedPath
                    path={`${url}/lots`}
                    component={ProfileLots}
                    condition={isLoggined}
                    fallback={{
                      pathname: "",
                      search: "?modal=login",
                    }}
                  />
                  <RestrictedPath
                    path={`${url}/settings`}
                    component={ProfileSettings}
                    condition={isLoggined}
                    fallback={{
                      pathname: "",
                      search: "?modal=login",
                    }}
                  />{" "}
                  <RestrictedPath
                    path={`${url}/favorites`}
                    component={ProfileLikedItems}
                    condition={isLoggined}
                    fallback={{
                      pathname: "",
                      search: "?modal=login",
                    }}
                  />
                  <RestrictedPath
                    path={`${url}/`}
                    component={ProfileSettings}
                    condition={isLoggined}
                    fallback={{
                      pathname: "",
                      search: "?modal=login",
                    }}
                  />
                </Switch>
              </ProfileLayout>
            )}
          />
        </Switch>
      </Layout>
    );
  
}
export default App;