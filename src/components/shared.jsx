//Shared Components like Footer, Header and so on.
import React from 'react';

export function Footer(props){
    const year = new Date().getFullYear()
    return <footer>© {year} Jacty</footer>
}
