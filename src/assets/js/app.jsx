import React, {useState} from 'react';

import {Footer} from '@com/shared.jsx';

export function App(){
    let [nav, setNav] = useState(1);
    function handleClickx(x){
        setNav(x)
    }
    return (
        <div>
        { nav === 1 ?
            <div> 111</div>:
            <div>222</div>
        }
            <Footer data={()=>handleClickx(0)}/>
        </div>
        )
    
}