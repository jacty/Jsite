import React from 'react';

function Footer(props){
    const year = new Date().getFullYear()
    return <footer>© {year} Jacty</footer>
}

export default Footer;