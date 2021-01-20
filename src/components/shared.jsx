//Shared Components like Footer, Header and so on.
import { J } from '@Jeact';

export function Footer(props){
    const year = new Date().getFullYear()
    return <footer>© {year} Jacty</footer>
}
