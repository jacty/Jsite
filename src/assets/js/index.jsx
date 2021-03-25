import {
    J, 
    createRoot,
    useState, 
    lazy, 
    Suspense
} from '@Jeact';

import '@assets/styles/main.sass';
// const AboutMe = lazy(()=>import('@assets/js/aboutme.jsx'));

// import {Footer} from '@com/shared.jsx';

function App(){
    {/*const [nav,setNav] = useState(0)*/}
    return( 
            <div> 111
                {/*

                <Suspense fallback={<div>11</div>}>
                    <AboutMe />
                </Suspense>
                
                
                    <Footer handlers={()=>{setNav(1)}}/>
                */}
                
            </div>
        )
}

createRoot(document.getElementById('root')).render(<App />);
