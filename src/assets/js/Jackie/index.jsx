import { J } from '@Jeact';
import data from '@data/Jackie.json';

import '@assets/styles/jackie.sass';

export default function Jackie(prop){
    const people = data.people;
    const keys = data.keys;
    const movies = data.movies;
    const lan = prop.lan === 'en' ? 0 : 1;

    const list = movies.map((item)=>{
        const path = `./assets/imgs/${item.name[0]}`;
        return <li key={item.id}>
                    <img className='poster' src={path + '/poster.webp'}  alt={item.name[lan]} title={item.name[lan]} width='135'/>
                    <div className='info'>
                        <h2>{item.name[lan]}</h2>
                        <div>
                            <em>{keys[0][lan]+': '}</em> 
                            <span>{people[item.directors][lan]}</span>
                        </div>
                    </div>
                </li>
    })
    return <div>
                <h1>Jackie's films</h1>
                <ul className='jackie'>{list}</ul>
            </div>
}