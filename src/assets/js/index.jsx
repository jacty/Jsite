import {
    createElement,
    createRoot,
} from '@Jeact';
const React = {
    createElement:createElement,
    createRoot:createRoot
};

import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';

import data from '@data/interview.json';
import '@assets/styles/main.sass';

import Interview from '@com/interview.jsx';
import {Footer} from '@com/shared.jsx';

React.createRoot(document.getElementById('root')).render(
    <Interview data = {data} />
)

    // <ErrorBoundary>
    //      
    //      <Footer />
    // </ErrorBoundary>