import {
    J, 
    createRoot,
    useEffect,
    useState, 
} from '@Jeact';

import '@assets/styles/main.sass';

function App(){
    const [cur, setCur] = useState(0);
    useEffect(()=>{
        return ()=>{
            document.title =1;
        }
    })
    return (
        <main>
            <a onClick={()=>{setCur(cur+1)}}>{cur}</a>
        </main>
    )
}

createRoot(document.getElementById('root')).render(<App />);
