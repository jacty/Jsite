import { J } from '@Jeact';
import './comments.sass';

export default function Comments(props){
  const list = props.data.map((item, i) => {
    return (<li key={i}>
              <p>{item.name}</p>
              <p>{item.date}</p>
              <p>{item.msg}</p>
            </li>)
  })
  return (<ul className='comments'>{list}</ul>)
}