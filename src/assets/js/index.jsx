import {
    J, 
    createRoot,
    useState, 
    lazy, 
    Suspense
} from '@Jeact';

import '@assets/styles/main.sass';
const AboutMe = lazy(()=>import('@assets/js/aboutme.jsx'));

createRoot(document.getElementById('root')).render(
            
        <Suspense>
            <h1>Demo</h1>
            {/*<AboutMe />*/}
        </Suspense>

    );
