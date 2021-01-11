import { J } from '@Jeact';
import Logo from './logo.jpg';
import './avatar.sass';

function Avatar(){
    return <img className='avatar' src={Logo} alt="Jacty" title="Jacty"/>
}

export default Avatar