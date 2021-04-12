import React, {Suspense, useState} from 'react';
import ReactDOM from 'react-dom';

import '@assets/styles/main.sass';
const Aboutme = React.lazy(()=>import('@com/aboutme.jsx'));

function App(){
    const [cur, setCur] = useState(0);
    const [cur1, setCur1] = useState(1);
    function handleClick(){
        setCur(cur+1);
        setCur1(cur1+1);
    }
    return (
        <main>
            <a onClick={handleClick}>{cur}{cur1}</a>
        </main>
    )
     
}


ReactDOM.createRoot = ReactDOM.unstable_createRoot;
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)

