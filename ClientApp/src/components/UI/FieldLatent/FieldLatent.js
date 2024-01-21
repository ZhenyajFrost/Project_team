import React, { useState } from 'react'

function FieldLatent({value, setValue, Inp}) {
    const [editing, setEditing] = useState(false);
    return editing ? <input onBlur={()=>setEditing(false)} onChange={(e)=>{setValue(e.target.value);}} defaultValue={value}/> : <p onClick={()=>setEditing(true)}>{value}</p>
    

}


export default FieldLatent;