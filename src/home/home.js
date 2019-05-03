import '../style.css';
import './style.css';
import {
    Scene, PerspectiveCamera, PointLight, BoxGeometry, Mesh,
    Font, TextGeometry, MeshLambertMaterial, WebGLRenderer
} from 'three';
var stacks = require('../animation_data/stacks.json');
var fontJSON = require("../../node_modules/three/examples/fonts/helvetiker_regular.typeface.json");
var scene = new Scene();
var camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var pointLight = new PointLight("white", 1, 100);
var font = new Font(fontJSON);
pointLight.position.set(0,20,20);
console.log(stacks);
var cubes = stacks.map(stack => {
    console.log("hello");
    var geo = new BoxGeometry(0.5, 0.5,0.5);
    geo.animations
    var mat = new MeshLambertMaterial();
    mat.color.set(0x11aa22);
    var c = new Mesh(geo, mat);
    c.position.x = stack.position.x;
    c.position.y = stack.position.y;
    c.position.z = stack.position.z;

    var textGeometry = new TextGeometry(stack.name, {
        font: font,
        size: 100,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
    });
    var textMat = new MeshLambertMaterial();
    var text = new Mesh(textGeometry, textMat);
    text.scale.set(0.001,0.001,0.001);
    text.position.setZ(0.25);
    text.position.setX(-0.3);
    c.add(text);

    return c;
});

scene.add(...cubes);
scene.add(pointLight);

camera.position.set(1.5,1.5,4);
camera.lookAt(1.5,1.5,0);

var renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 110 );
document.body.appendChild( renderer.domElement );
renderer.render( scene, camera );
var t;
var animate = function () {
    t = new Date().getTime() / 1000;
    cubes.forEach(c => {
        c.rotation.y = t;
    });
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();
