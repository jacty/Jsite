import React from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';

import data from '@data/interview.json';
import '@assets/styles/main.sass';

import Interview from '@com/Interview/interview.jsx';
import Footer from '@com/Footer/footer.jsx';

ReactDOM.render(
    <ErrorBoundary>
        <Interview data = {data}/>
        <Footer />
    </ErrorBoundary>,
    document.getElementById('root')
)
