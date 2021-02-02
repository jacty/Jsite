//Shared Components like Footer, Header and so on.
import React from 'react';

export function Footer(props){
    function handleClick(x){
        console.log('xx',props)
        props.data();
    }
    const year = new Date().getFullYear()

    return <footer>© {year} <a onClick={handleClick}>Jacty</a></footer>
}
