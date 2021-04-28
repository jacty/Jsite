import {
    J, 
    createRoot,
    Suspense,
    lazy, 
} from '@Jeact';
import Aboutme from '@com/Aboutme/aboutme';
import {Footer} from '@com/shared';
import '@assets/styles/main.sass';

function App(){
    return (<div className='page'>
                <Aboutme />
                <Footer />
            </div>
           )
    
}

createRoot().render(<App />);

