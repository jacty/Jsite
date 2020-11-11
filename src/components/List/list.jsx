import React, {useState} from 'react';

function List(props){
    const [cur, setCur] = useState(0);

    function handleClick(ind, ref){
        setCur(cur => cur = cur===ind ? '' : ind);
        ref.current.scrollIntoView();
    }

    const list = props.items.map((item,ind)=>{
        const ref = React.createRef();
        return <li key={ind}
                    className={cur===ind?'cur':''}
                    onClick={()=>handleClick(ind, ref)} ref={ref}>
                    <h2>{item.header}</h2>
                    <div dangerouslySetInnerHTML={{__html:item.content}}></div>
                </li>
    })
    return <ul>{list}</ul>
}

export default List;