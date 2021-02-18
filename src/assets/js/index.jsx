import {J, createRoot,useState} from '@Jeact';

import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';
import '@assets/styles/main.sass';

import Aboutme from './aboutme.jsx';
import {Footer} from '@com/shared.jsx';

function App(){
    const [nav,setNav] = useState(0)    
    return( 
            <ErrorBoundary>
                {nav ===0?
                    <div>111</div>:
                    <div>222</div>
                }

                <Footer handlers={()=>{setNav(1)}}/>
            </ErrorBoundary>
        )
}

createRoot(document.getElementById('root')).render(<App />);
