import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';

import '@assets/styles/main.sass';
const Aboutme = React.lazy(()=>import('@com/aboutme.jsx'));

function App(){
    return (
        <div>
            <Suspense fallback={<div>fallback</div>}>
                <Aboutme />
            </Suspense>
        </div>
    )
}

ReactDOM.createRoot = ReactDOM.unstable_createRoot;
ReactDOM.createRoot(document.getElementById('root')).render(<App />)

