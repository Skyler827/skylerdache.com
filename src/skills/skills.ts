import '../style.css';
import './skills.css';
import '../sitemap';
let flask = require('../../img/flask.png');
console.log(flask);
(<HTMLImageElement>document.getElementById('flask-image')).src = '/'+flask;
