import '../style.css';
import './style.css';
import {
    Scene, PerspectiveCamera, PointLight, BoxGeometry, Mesh,
    Font, TextGeometry, MeshLambertMaterial, WebGLRenderer, AnimationClip, KeyframeTrack,
    NumberKeyframeTrack, Clock, AnimationMixer, LoopPingPong, LoopOnce, AmbientLight, PlaneGeometry, 
    MeshPhongMaterial, MeshStandardMaterial, Color, HemisphereLight, MeshBasicMaterial, SphereBufferGeometry, BackSide, DoubleSide
} from 'three';
let stackPositions: string = require("../animation_data/stackPositions.txt").default;
let stacks: Array<{
    name:string, position:{x:number,y:number, z:number},
    startTime: number
}> = require('../animation_data/stacks.json');
let fontJSON = require("../../node_modules/three/examples/fonts/helvetiker_regular.typeface.json");
let scene = new Scene();
let camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var hemisphereLight = new HemisphereLight( 0xffffbb, 0x080820, 1 );
let ambientLight = new AmbientLight( 0xaaaaaa ); // soft white light
let font = new Font(fontJSON);

let cubeGeo = new BoxGeometry(1, 0.6, 0.6);
let greenStuff = new MeshLambertMaterial();
let greenHex = 0x11aa22
greenStuff.color.setHex(greenHex);
let groundGeo = new PlaneGeometry(4000,4000);
let groundMaterial = new MeshLambertMaterial();
groundMaterial.color.setHex(0x4a2233);
let ground = new Mesh(groundGeo, groundMaterial);
ground.rotateX(-Math.PI/2);
ground.translateZ(-10);
scene.add(ground);

// To add a Sky:
//var skyGeo = new SphereBufferGeometry( 400, 32, 15 );
//var skyMat = new MeshBasicMaterial();
//skyMat.color = new Color(0x3344dd);
//skyMat.side = DoubleSide;
//var sky = new Mesh( skyGeo, skyMat );
//scene.add( sky );

let t_max = 3;
let dt = 0.01;
let times = Array(Math.ceil(t_max/dt)).fill(0).map((_,i) => dt*i);
let dropheight = 10;
let fallInAnimation = ((nodeName:string, x0:number, y0:number, z0:number): AnimationClip => {
    let x_of_t = (t:number):number => {
        return x0;
    };
    let y_of_t = (t:number):number => {
        return y0 + dropheight *(1 - Math.pow(t/t_max,2));
    };
    let z_of_t = (t:number):number => {
        return z0;
    };
    return new AnimationClip("Fall In", -1,[
        new NumberKeyframeTrack(`${nodeName}.position[x]`, times, times.map(x_of_t)),
        new NumberKeyframeTrack(`${nodeName}.position[y]`, times,times.map(y_of_t)),
        new NumberKeyframeTrack(`${nodeName}.position[z]`, times, times.map(z_of_t)),
    ]);
});

let lines = stackPositions.split("\n").slice(0,-1);
// console.log(lines);
let cubeCoords = lines.reduce((prevPositions: Array<{x:number, z:number}>, newLine, lineNumber) => 
    prevPositions.concat(newLine.split('')
    .map((char, colNumber)=>({c:char, x:colNumber, z:lineNumber}))
    .filter(x => x.c === "#")
    .map(o => ({x:o.x, z:o.z}))), []);
console.log(cubeCoords);

let cubesAndStartTimes: Array<[Mesh, number]> = cubeCoords.map((coordPair, i) => {
    let c = new Mesh(cubeGeo, greenStuff);
    c.name = `box${i}`;
    c.position.x = coordPair.x;
    c.position.y = 0;
    c.position.z = coordPair.z;
    if (i < 5) {
        let textGeometry = new TextGeometry("ayyy", {
            font: font,
            size: 100,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelSegments: 5
        });
        let textMat = new MeshStandardMaterial();
        textMat.color = new Color(0xffffff);
        textMat.depthWrite = false;
        textMat.dithering = true;
        let text = new Mesh(textGeometry, textMat);
        text.scale.set(0.0015,0.0015,0.0015);
        text.position.setZ(0.36);
        text.position.setX(-0.35);
        text.position.setY(0.1);
        c.add(text);
    }

    return [c, i];
});
let mixers = cubesAndStartTimes.map(cubeAndStartTime => {
    let cube = cubeAndStartTime[0];
    let startTime = cubeAndStartTime[1];
    let mixer = new AnimationMixer(cube);
    let animation = fallInAnimation(cube.name, cube.position.x,cube.position.y, cube.position.z);
    let animationAction = mixer.clipAction(animation);
    animationAction.setLoop(LoopOnce,1);
    animationAction.clampWhenFinished = true;
    // animationAction.play();
    // animationAction.startAt(startTime);
    return mixer;
});
scene.add(...cubesAndStartTimes.map(x=>x[0]));
scene.add( ambientLight );
scene.add( hemisphereLight );

camera.position.set(50,50,30);
camera.lookAt(50,0,0);

let renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 100 );
document.body.appendChild( renderer.domElement );
let clock = new Clock();
let animate = function () {
    let dt = clock.getDelta();
    let t = clock.getElapsedTime();
    // mixers.forEach(mixer => {
    //     mixer.update(dt);
    // });
    camera.lookAt(50+10*Math.sin(t/2),0,10);
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();
