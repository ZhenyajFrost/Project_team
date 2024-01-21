import React, { useState } from 'react'

import './Profile.css'
import FieldLatent from '../components/UI/FieldLatent/FieldLatent'
function Profile() {
    const [user, setUser] = useState({
        firstName:"Oleg",
        lastName:"Vynik"
    })
    if(true){
        return <>
            <FieldLatent value={user.firstName} setValue={(v)=>setUser({...user, firstName:v})}/>
            <FieldLatent value={user.lastName} setValue={(v)=>setUser({...user, lastName:v})} Inp={<h1>dick</h1>}/>
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