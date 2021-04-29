import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import Avatar from '@com/Avatar/avatar';
import '@assets/styles/main.sass';
const Aboutme = React.lazy(()=>import('@com/aboutme.jsx'));

function App(){
  const [cur, setCur] = useState(0)
    return (
        <main onClick={()=>setCur(cur+1)}>
          <Avatar />
        </main>
    )
     
}


ReactDOM.createRoot = ReactDOM.unstable_createRoot;
ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)

