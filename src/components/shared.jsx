//Shared Components like Footer, Header and so on.
import React from 'react';

export function Footer(props){
    function handleClick(x){
        console.error('error');
    }
    const year = new Date().getFullYear()
    return <footer><a href='#' onClick={handleClick}>©</a> {year} Jacty</footer>
}
