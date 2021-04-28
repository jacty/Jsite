import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';

import '@assets/styles/main.sass';
const Aboutme = React.lazy(()=>import('@com/aboutme.jsx'));

function App(){

    return (
        <main className='demo' onClick={()=>{console.log(1)}}>
            <Suspense fallback={<div>Loading</div>}>
                <Aboutme />
            </Suspense>
        </main>
    )
     
}


ReactDOM.createRoot = ReactDOM.unstable_createRoot;
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)

