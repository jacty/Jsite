import {
    J, 
    createRoot,
    Suspense,
    lazy, 
} from '@Jeact';

const Avatar = lazy(() => import('@com/Avatar/avatar'));
import '@assets/styles/main.sass';

function App(){
    return (<main>
             <Suspense fallback={<div>Loading</div>}>
                 <Avatar />
             </Suspense>   
           </main>)
    
}

createRoot(document.getElementById('root')).render(<App />);

