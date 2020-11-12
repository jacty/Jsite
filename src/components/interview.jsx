import React, { Suspense, useState, useEffect } from 'react';

import '@assets/styles/interview.sass';
const List = React.lazy(()=> import('@com/List/list.jsx'));

import {rnd} from '@assets/js/helpers/nums';
    
let flag = 0; //1: show all questions; 0: show a random question
const mask = 1; // Toggle mask;

function Interview(props){
    document.title='Interview Q&A';
    const items = props.data;
    const [ind, setInd] = useState(0);
    const btnAllTxt = ['All Questions','Random Question'];
    const btnTitleTxt = ['List all questions','Show a random question'];

    function handleClickNext(){
        let _ind = rnd(0, items.length-1);

        //Avoid repeating the same question;
        while(_ind===ind){
            _ind = rnd(0, items.length-1);
        }
        setInd(_ind);
    }

    function handleClickAll(){
        flag = flag ^ mask;
        flag > 0?setInd(-1):handleClickNext();
    }

    let questions;
    if(flag===1){//List all questions.
        questions = <List items={props.data} />
    } else{// Choose a random question.
        questions = <div>
            <h2>{items[ind].header}</h2>
            <div dangerouslySetInnerHTML={{__html:items[ind].content}}></div>
        </div>
    }

    return (
            <div>
               <h1>Interview Q&A</h1>
               <Suspense fallback={<div className='loading'>Loading...</div>}>
                    {flag === 0 ?
                        <button title='Choose a random question' 
                            onClick={()=>handleClickNext()}>Next
                        </button>:
                        ""
                    }
                    <button title={btnTitleTxt[flag]}
                        onClick={()=>handleClickAll()}>{btnAllTxt[flag]}
                    </button>
                    {questions}
                </Suspense>
            </div>
        )
}

export default Interview;

