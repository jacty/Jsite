import React from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from './components/Errors/ErrorBoundary.jsx';

import data from './data/interview.json';
import './assets/styles/main.sass';

import Interview from './components/Interview/interview.jsx';
import Footer from './components/Footer/footer.jsx';

ReactDOM.render(
    <ErrorBoundary>
        <Interview data = {data}/>
        <Footer />
    </ErrorBoundary>,
    document.getElementById('root')
)
