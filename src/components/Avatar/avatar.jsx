import {createElement} from '@Jeact';
import Logo from './logo.jpg';
// import './avatar.sass';
const React = {createElement:createElement};

function Avatar(){
    return <img className='avatar' src={Logo} alt="Jsite's Logo" title="Jsite's Logo"/>
}

export default Avatar