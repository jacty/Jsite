import {
    J, 
    createRoot,
    useState,
} from '@Jeact';
import Aboutme from '@com/Aboutme/aboutme';
import {Footer} from '@com/shared';
import '@assets/styles/main.sass';

function App(){
  const [curPage, setCurPage] = useState(10);
    return (<div className='page'>
                {curPage}
                <Aboutme />
                <Footer onClick={()=>setCurPage(curPage)} cur={curPage}/>
            </div>
           )
    
}

createRoot().render(<App />);

