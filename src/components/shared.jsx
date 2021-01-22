//Shared Components like Footer, Header and so on.
import React from 'react';

export function Footer(props){
    function handleClick(){
        console.log(1);
    }
    const year = new Date().getFullYear()
    return <footer>© {year} <a onClick={handleClick}>Jacty</a></footer>
}
