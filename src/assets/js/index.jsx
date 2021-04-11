import React, {Suspense, useState} from 'react';
import ReactDOM from 'react-dom';

import '@assets/styles/main.sass';
const Aboutme = React.lazy(()=>import('@com/aboutme.jsx'));

function App(){
    const [cur, setCur] = useState(0);
    if(cur>0){
        return (
            <main>
                <p key={1}>1</p>
                <p key={2}>2</p>
                <a onClick={()=>{setCur(x=>x+1)}}>{cur}</a>
            </main>
        )
    } else {
        return (
            <main>
                <p key={2} className='2'>2</p>
                <p key={1}>1</p>
                <a onClick={()=>{setCur(x=>x+1)}}>{cur}</a>
            </main>
        )
    } 
}


ReactDOM.createRoot = ReactDOM.unstable_createRoot;
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)

