import { J } from '@Jeact';
import Logo from './logo.jpg';
import './avatar.sass';

function Avatar(){
    function handleError(){
        console.log('error')
    }
    return <img className='avatar' onError={handleError} src={Logo} alt="Jacty" title="Jacty"/>
}

export default Avatar