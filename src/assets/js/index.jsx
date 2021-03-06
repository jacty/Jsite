import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';

import {App} from '@assets/js/app.jsx';
import '@assets/styles/main.sass';

// import Aboutme from '@com/aboutme.jsx';


const Aboutme = React.lazy(()=>import('@com/aboutme.jsx'));

ReactDOM.createRoot = ReactDOM.unstable_createRoot;

ReactDOM.createRoot(document.getElementById('root')).render(
    <Suspense fallback ={<div>11</div>}>
    <Aboutme />
    </Suspense>
)

