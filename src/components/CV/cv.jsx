import React from 'react';
import Avatar from '../Avatar/avatar.jsx';
import './cv.sass';

class CV extends React.Component {
    constructor(props){
        super(props)
        this.state = {aside:'jacty'}
    }
    componentDidMount(){
        document.title='About Me - Jsite';
        //Random aside.
        const _aside = [...this.state.aside];
        _aside.map((x,ind)=>{
            if(Math.random()>0.5){
                _aside[ind] = x.toUpperCase()
            }
        })
        this.setState({
            aside:_aside
        })

    }
    render(){

       return <div className="page">
                    <header>
                        <Avatar />
                        <h1>Hi! I'm Jacty</h1>
                    </header>
                    <main>
                        <section className='intro'>
                            <h2>Front End Developer</h2>
                            <p>Have been working in IT industry for a decade from IT supportive developer to front end developer, currently focusing in React.</p>
                            <div className='aside'>
                                <div>{this.state.aside}</div>
                                <div>{this.state.aside}</div>
                            </div>
                        </section>
                        {/*<section className='career'>
                            <ul className='c_nav'>
                                <li>Skills</li>
                                <li>Projects</li>
                            </ul>
                            <div className='c_list'>
                                <ul>
                                    <li>ES6</li>
                                    <li>React</li>
                                    <li>CSS3&Grid</li>
                                    <li>Python</li>
                                </ul>
                                <ul>
                                    <li>Interview Q&A</li>
                                </ul>
                            </div>
                        </section>*/}
                    </main>
                </div>
    }
}

export default CV