import { J } from '@Jeact';
import Avatar from '@com/Avatar/avatar.jsx';
import '@assets/styles/aboutme.sass';
function Aboutme(){
    return <section className='aboutme'>
                <Avatar />
                <h1>Jacty</h1>
                <quote className='motto'>No one is coming!</quote>
            </section>
}

export default Aboutme;