import {J, createRoot,useState, lazy, Suspense} from '@Jeact';

import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';
import '@assets/styles/main.sass';
const AboutMe = lazy(()=>import('@assets/js/aboutme.jsx'));

import {Footer} from '@com/shared.jsx';

function App(){
    const [nav,setNav] = useState(0)    
    return( 
            <ErrorBoundary>
                <Suspense>
                    <AboutMe />
                </Suspense>
                <Footer handlers={()=>{setNav(1)}}/>
            </ErrorBoundary>
        )
}

createRoot(document.getElementById('root')).render(<App />);
