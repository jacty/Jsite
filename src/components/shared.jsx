//Shared Components like Footer, Header and so on.
import React from 'react';

export function Footer(props){
    function handleClick(x){
        console.log(x);
    }
    const year = new Date().getFullYear()
    return <footer><img src='#' onError={handleClick(1)} onLoad={handleClick(2)}/>© {year} <a onClick={handleClick}>Jacty</a></footer>
}
