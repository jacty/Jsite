import {
    createElement,
    createRoot,
} from '@Jeact';
import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';
import '@assets/styles/main.sass';

import Aboutme from '@com/aboutme.jsx';
import {Footer} from '@com/shared.jsx';

const React = {
    createElement:createElement,
    createRoot:createRoot
};

React.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
         <Aboutme></Aboutme>
         <Footer />
    </ErrorBoundary>
)

