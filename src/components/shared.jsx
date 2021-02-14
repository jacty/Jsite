//Shared Components like Footer, Header and so on.
import {J} from '@Jeact';

export function Footer(props){
    const year = new Date().getFullYear()
    return <footer>©{year} <a onClick={props.handlers}>Jacty</a></footer>
}
