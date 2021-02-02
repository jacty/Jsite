import React, {useState} from 'react';

import {Footer} from '@com/shared.jsx';

export function App(){
    let [nav, setNav] = useState(1);
    function handleClick(){
        nav=nav+1;
        console.log(nav);
    }
    if(nav===1){
        return <div>
                    <div>111</div>
                    <Footer data={()=>{setNav(nav+1)}}/>
                </div>
    } else {
        return <div>
                    <div>222</div>
                    <Footer />
                </div>
    }
}