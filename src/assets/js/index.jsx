import {
    J, 
    createRoot,
    useState,
} from '@Jeact';
import Aboutme from '@com/Aboutme/aboutme';
import Jackie from '@com/Jackie/'
import {Footer} from '@com/shared';
import '@assets/styles/main.sass';

function App(){
  const [curPage, setCurPage] = useState(0);
    return (<div className='page'>
            { curPage === 0 ?
                <Aboutme /> :
                <Jackie />
            }
                <Footer onClick={()=>setCurPage(0)}/>
            </div>
           )
    
}

createRoot().render(<App />);

