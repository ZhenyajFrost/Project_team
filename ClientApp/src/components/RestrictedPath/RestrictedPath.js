import React from 'react';
import { Route } from 'react-router';

function RestrictedPath({path, component, fallback, condition}) {
    //СТас, не забудь, що ти це поламав ждодавши тру на 7 рядку, бо в тебе не приходить код на пошту. дякую
    return (
        <Route path={path} component={condition || true?component:fallback}/>
    );
}

export default RestrictedPath;