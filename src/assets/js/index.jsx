import {
    J, 
    createRoot,
    useState, 
    lazy, 
    Suspense
} from '@Jeact';

import '@assets/styles/main.sass';

function App(){
    const [cur, setCur] = useState(0);
    if(cur>0){
        return (
            <main>
                <p key={1}>1</p>
                <p key={2}>2</p>
                <a onClick={()=>{setCur(x=>x+1)}}>{cur}</a>
            </main>
        )
    } else {
        return (
            <main>
                <p key={2}>2</p>
                <p key={1}>1</p>
                <a onClick={()=>{setCur(x=>x+1)}}>{cur}</a>
            </main>
        )
    } 
}

createRoot(document.getElementById('root')).render(<App />);
