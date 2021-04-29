import React from 'react';
import './aboutme.sass';

import Avatar from '@com/Avatar/avatar';

function Aboutme(){
    return (
        <div className='aboutme'>
            <header>
                <Avatar /> 
                <h1>Jacty</h1>
                <p>React developer keen on adapting React philosophy to practice. Make it practical and simple.</p>  
            </header>
            <main>
                <section className='projects'>
                    <h2>What I am working on:</h2>
                        <ul>
                            <li>
                                <h3>Jsite</h3>
                                <p>This is a project I am currently working hard on and what you are scrolling. The intention is 1) I want to build my own website in which I will type every piece of code by myself rather than copy&paste or just import others' libs. 2) Front end has been changed massively, the flaw of which is we have to import loads of unused code just to finish a feature regardless how easy the feature is. So I want to make my code as easy, simple and clear as I can and this supports the 1st intention too. 
                                </p>
                                <p>It is interesting and chanllenge. This project currently is supported by [<b>Jeact.js</b>] which is my own mini version of [<b>React.js</b>].
                                </p>
                            </li>
                        </ul>
                    </section>
                </main>
        </div>
    )
}

export default Aboutme