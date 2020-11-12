import React, { Suspense, useState, useEffect } from 'react';

import '@assets/styles/interview.sass';
const List = React.lazy(()=> import('@com/List/list.jsx'));

import {rnd} from '@assets/js/helpers/nums';

function Interview(props){
    document.title='Interview Q&A';
    const items = props.data;
    const [ind, setInd] = useState(0);

    function handleClick(){
        let _ind = rnd(0, items.length-1);

        //Avoid repeating the same question;
        while(_ind===ind){
            _ind = rnd(0, items.length-1);
        }
        setInd(_ind);
    }

    return (
            <div>
               <h1>Interview Q&A</h1>
               <Suspense fallback={<div className='loading'>Loading...</div>}>
                    <button title='Choose a random question' 
                        onClick={()=>handleClick()}>Next
                    </button>
                    <div>
                        <h2>{items[ind].header}</h2>
                        <div dangerouslySetInnerHTML={{__html:items[ind].content}}></div>
                    </div>
                </Suspense>
            </div>
        )
}

export default Interview;

