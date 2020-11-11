import React, { Suspense } from 'react';

import '../../assets/styles/interview.sass';
const List = React.lazy(()=> import('../List/list.jsx'));

function Interview(props){
    document.title='Interview Q&A';
    return (
            <div>
               <h1>Interview Q&A</h1>
               <Suspense fallback={<div className='loading'>Loading...</div>}>
                <List items={props.data} />
                </Suspense>
            </div>
        )
}

export default Interview;