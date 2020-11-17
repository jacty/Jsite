import {
    createElement,
} from '@Jeact';
const React = {createElement:createElement};

function ErrorBoundary(props){
    return props.children;
}

export default ErrorBoundary;