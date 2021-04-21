import {
    J, 
    createRoot,
    Suspense 
} from '@Jeact';
import Avatar from '@com/Avatar/avatar'
import '@assets/styles/main.sass';

function App(){
    return (<main>
             <Suspense fallback={<div>'Loading'</div>}>
                 <Avatar />
             </Suspense>   
           </main>)
    
}

createRoot(document.getElementById('root')).render(<App />);

