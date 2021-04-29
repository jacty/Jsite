import React, {useState} from 'react';
import ReactDOM from 'react-dom';

import Aboutme from '@com/Aboutme/aboutme';
import {Footer} from '@com/shared';

import '@assets/styles/main.sass';

function App(){
  const [curPage, setCurPage] = useState(10);
    return (
      <div className='page'>
        {curPage}
        <Aboutme />
        <Footer onClick={()=>{setCurPage(curPage + 1)}} cur={curPage}/>
      </div>
    )
}

ReactDOM.createRoot = ReactDOM.unstable_createRoot;
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
