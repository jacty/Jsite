import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

import '@assets/styles/main.sass';
const Aboutme = React.lazy(()=>import('@com/aboutme.jsx'));

function App(){
    const [cur, setCur] = useState(0)
    useEffect(()=>{
        document.title = '11';
        return ()=>{
            document.title = '2';
        }
    })
    return (
        <main>
            <a onClick={()=>{setCur(cur+1)}}>{cur}</a>
        </main>
    )
     
}


ReactDOM.createRoot = ReactDOM.unstable_createRoot;
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)

