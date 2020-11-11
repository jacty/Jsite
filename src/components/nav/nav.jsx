import React from 'react';
import List from './../List/list.jsx';

class Nav extends React.Component {
    constructor(props){
        super(props);

        this.state = {cur:0}

        this.handleClick = this.handleClick.bind(this)

    }
    handleClick(ind){
        this.setState({cur:ind})
    }
    render() {
        return <nav>
                    <ul>
                        <List items={this.props.items} onHandleClick={this.handleClick} cur={this.state.cur}/>                
                    </ul>
                </nav>
    }
}

export default Nav;