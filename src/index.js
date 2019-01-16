import _ from './lodash';
import printMe from './print'
import './style.css';

console.log("Lodash output: "+_.add(1,1));

function component() {
    var element = document.createElement('div');
    var btn = document.createElement('button');
    element.innerHTML = "Hello webpack!";
    btn.innerHTML = 'Click me and check the console!';
    btn.onclick = printMe;

    element.appendChild(btn);

    return element;
}

document.getElementById("links-section").appendChild(component());