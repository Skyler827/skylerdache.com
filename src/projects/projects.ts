import '../style.css';
import '../sitemap';
import './projects.css';
import load_images from './load_images';

load_images({
    ".screenshot-fos": require("../../img/foodproject/order.png"),
    ".screenshot-lol-calc": require("../../img/lol_calc/output.png"),
    ".pongapp-screenshot": require("../../img/pongapp/game.png")
});
