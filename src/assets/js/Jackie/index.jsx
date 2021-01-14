import { J } from '@Jeact';
import data from '@data/Jackie.json';

export default function Jackie(prop){
    const people = data.people;
    const keys = data.keys;
    const movies = data.movies;
    const lan = prop.lan === 'en' ? 0 : 1;

    const list = movies.map((item)=>{
        const path = `./assets/imgs/${item.name[0]}`;
        return <li key={item.id}>
                    <img src={path + '/poster.webp'}  alt={item.name[lan]} title={item.name[lan]} width='135'/>
                    <div>
                        {item.name[lan]}
                    </div>
                    <div>
                        {keys[0][lan]+': '+ people[item.director][lan]}
                    </div>
                </li>
    })
    return <ul>{list}</ul>
}