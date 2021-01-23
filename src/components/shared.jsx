//Shared Components like Footer, Header and so on.
import {J, useState} from '@Jeact';

export function Footer(props){
    // const [cur, setCur] = useState(0);
    function handleClick(){
        console.log(1,props);
        // setCur()
    }
    const year = new Date().getFullYear()
    return  <footer>© {year} <a onClick={handleClick}>Jacty</a></footer>
}
