//Shared Components like Footer, Header and so on.
// import React from 'react';
import Jeact from '@lib/Jeact';

const React = Jeact;

export function Footer(props){
    const year = new Date().getFullYear()
    return <footer>© {year} Jacty</footer>
}
console.error('Footer',Footer());
// Jeact.createElement('footer', null, '\xA9', year, 'Jacty');