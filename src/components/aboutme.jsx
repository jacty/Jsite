import {createElement} from '@Jeact';
import Avatar from '@com/Avatar/avatar.jsx';

const React = {createElement:createElement};

function Aboutme(){
    return <section className='aboutme'>
                <Avatar />
                <h1>Jacty</h1>
            </section>
}

export default Aboutme;