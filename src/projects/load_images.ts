export default function load_images(imageNames: {[s:string]:string}) {
    console.log("hello from load_images");
    for (let imageName in imageNames) {
        let img = <HTMLImageElement>document.querySelector(`#${imageName}`);
        if (img) {
            img.src = "/"+imageNames[imageName];
        } else {
            console.log(`problem: no such element "document.querySelector('#${imageName}')".`);
        }
    }    
}
