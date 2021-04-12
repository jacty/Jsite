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
    const [cur1, setCur1] = useState(1);
    function handleClick(){
        setCur(cur+1);
        // setCur1(cur1+1);
    }
    return (
        <main>
            <a onClick={handleClick}>{cur}</a>
        </main>
    )
}

createRoot(document.getElementById('root')).render(<App />);
