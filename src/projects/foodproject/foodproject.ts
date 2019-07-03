import '../../style.css';
import '../../sitemap';
import '../project.css';
import './foodproject.css';
import load_images from '../load_images';
let login = require('../../../img/foodproject/login.png');
let diningRoom = require('../../../img/foodproject/dining-room.png');
let order = require('../../../img/foodproject/order.png');

let images = {
    "login":login,
    "dining-room":diningRoom,
    "order":order
};
load_images(images);
