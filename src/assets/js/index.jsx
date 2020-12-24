import React from 'react';
import ReactDOM from 'react-dom';

import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';
import '@assets/styles/main.sass';

import Aboutme from '@com/aboutme.jsx';
import {Footer} from '@com/shared.jsx';

ReactDOM.createRoot = ReactDOM.unstable_createRoot;

ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
         <Aboutme></Aboutme>
         <Footer />
    </ErrorBoundary>
)

