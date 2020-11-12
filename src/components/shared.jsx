//Shared Components like Footer, Header and so on.
import Jeact from '@Jeact';

const React = Jeact;

export function Footer(props){
    const year = new Date().getFullYear()
    return <footer>© {year} Jacty</footer>
}
