import React from 'react';
import { Route } from 'react-router';

function RestrictedPath({path, component, fallback, condition}) {
    
    return (
        <Route path={path} component={condition?component:fallback}/>
    );
}

export default RestrictedPath;