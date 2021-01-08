import React from 'react';
import Logo from './logo.jpg';
// import './avatar.sass';

class Avatar extends React.Component {
    constructor(props){
        super(props)
    }
    render(){
        return <img src={Logo} alt="Jsite's Logo" title="Jsite's Logo"/>
    }
}

export default Avatar