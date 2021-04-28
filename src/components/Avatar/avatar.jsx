import { J } from '@Jeact';
import Logo from './logo.jpg';
import './avatar.sass';

function Avatar(){
    function handlerError(){
      console.error('handlerError')
    }
    return <img className='avatar' src={Logo} onError={handlerError}alt="Jacty" title="Jacty"/>
}

export default Avatar