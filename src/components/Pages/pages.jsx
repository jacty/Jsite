import React from 'react';

class Pages extends React.Component {
    constructor(props){
        super(props);
        this.state={cur:this.props.cur};

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(e){
        this.setState({cur:e.target.value})
    }
    handleClick(x){
        if(x<0){//turn to previous page
            if(this.state.cur>1){
                this.props.onPageTurn(this.state.cur - 1);//Update parent component
                this.setState({cur:this.state.cur - 1});//Update local state.
            }
        } else if(x>0){
            if(this.state.cur < this.props.max){
                this.props.onPageTurn(this.state.cur + 1);
                this.setState({cur:this.state.cur + 1});
            }
        } else {
            if(this.state.cur !== this.props.cur){//Avoid reloading current page
                if(this.state.cur <= 0){// Turn to the 1st page when mis-input negative number.
                    this.props.onPageTurn(1);
                    this.setState({cur:1});
                } else if(this.state.cur > this.props.max){//Turn to last page when mis-input a number bigger than total page amount.
                    this.props.onPageTurn(this.props.max);
                    this.setState({cur:this.props.max});
                } else {
                    this.props.onPageTurn(this.state.cur);
                }
            }
        }
    }
    render() {
        return <ul className='pages'>
                    <li title='previous' onClick={this.handleClick.bind(this,-1)}>⬅️ </li>
                    <li><input type='number' value={this.state.cur} onChange={this.handleChange.bind(this)} min='1' max={this.props.max}/></li>
                    <li onClick={this.handleClick.bind(this,0)}>Go</li>
                    <li title='next' onClick={this.handleClick.bind(this,1)}>➡️</li>
                    <li>In total {this.props.max} page{this.props.max>1?'s':''}</li>
                </ul>                
    }
}

export default Pages;