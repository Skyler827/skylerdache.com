/**
 * Loads images
 * @param imageMap a map from the HTML selector to the filename of the image
 */
export default function load_images(imageMap: {[s:string]:string}) {
    for (let imageSelector in imageMap) {
        let img = <HTMLImageElement>document.querySelector(`${imageSelector}`);
        if (img) {
            img.src = "/"+imageMap[imageSelector];
        } else {
            console.warn(`problem: no such element "document.querySelector('#${imageSelector}')".`);
        }
    }    
}
