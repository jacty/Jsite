import {
    J, 
    createRoot,
    useState, 
    lazy, 
    Suspense
} from '@Jeact';

import '@assets/styles/main.sass';

function App(){
    const [cur, setCur] =  useState(0);
    return (
        <a onClick={()=>{setCur(x=>x+1)}}>{cur}</a>
    )
}

createRoot(document.getElementById('root')).render(<App />);
