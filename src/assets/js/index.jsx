import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import Aboutme from '@com/Aboutme/aboutme';
import {Footer} from '@com/shared';

import '@assets/styles/main.sass';

function App(){
  const [curPage, setCurPage] = useState(0);
    return (
      <div className='page'>
        {curPage === 0?
          <Aboutme />:
          <h1>demo</h1>
        }
        <Footer onClick={()=>{setCurPage(1)}} cur={curPage}/>
      </div>
    )
}

ReactDOM.createRoot = ReactDOM.unstable_createRoot;
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
