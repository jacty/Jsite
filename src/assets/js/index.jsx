import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';

import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';
import '@assets/styles/main.sass';

// import Aboutme from '@com/aboutme.jsx';
import {Footer} from '@com/shared.jsx';

const Aboutme = React.lazy(()=>import('@com/aboutme.jsx'));

ReactDOM.createRoot = ReactDOM.unstable_createRoot;

ReactDOM.createRoot(document.getElementById('root')).render(
    <Suspense fallback={<div>demo</div>}>
        <Aboutme></Aboutme> 
    </Suspense>
)

