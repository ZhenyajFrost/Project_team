import React, { useState } from 'react'

import './Profile.css'
import FieldLatent from '../components/UI/FieldLatent/FieldLatent'
function Profile() {
    const [user, setUser] = useState({
 
        lastName:"Vynik"
    })
    if(true){
        return <>
            <span>First name</span><FieldLatent value={user.firstName} setValue={(v)=>setUser({...user, firstName:v})}/>
            <span>Last name</span><FieldLatent value={user.lastName} setValue={(v)=>setUser({...user, lastName:v})}/>
        </>
    }else{
        return <>
        <h1 className='profile-error'>
            <span>Зайди</span> <span>в</span> <span>акаунт</span><br/> <span>сука</span>
        </h1>
        </>
    }
    

}


export default Profile;