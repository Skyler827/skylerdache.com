import '../style.css';
import './style.css';
import {
    Scene, PerspectiveCamera, PointLight, BoxGeometry, Mesh,
    Font, TextGeometry, MeshLambertMaterial, WebGLRenderer, AnimationClip, KeyframeTrack,
    NumberKeyframeTrack, Clock, AnimationMixer, LoopPingPong, LoopOnce, AmbientLight, PlaneGeometry, 
    MeshPhongMaterial, MeshStandardMaterial, Color, HemisphereLight, MeshBasicMaterial, SphereBufferGeometry, BackSide, DoubleSide, Vector3
} from 'three';
const stackPositions: string = require("../animation_data/stackPositions.txt").default;
const stacks: Array<{
    name:string, position:{x:number,y:number, z:number},
    startTime: number
}> = require('../animation_data/stacks.json');
const fontJSON = require("../../node_modules/three/examples/fonts/helvetiker_regular.typeface.json");
const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const hemisphereLight = new HemisphereLight( 0xffffbb, 0x080820, 1 );
const ambientLight = new AmbientLight( 0xaaaaaa ); // soft white light
const font = new Font(fontJSON);

const cubeGeo = new BoxGeometry(1, 0.6, 0.6);
const greenStuff = new MeshLambertMaterial();
const greenHex = 0x11aa22
greenStuff.color.setHex(greenHex);
const groundGeo = new PlaneGeometry(4000,4000);
const groundMaterial = new MeshLambertMaterial();
groundMaterial.color.setHex(0x4a2233);
const ground = new Mesh(groundGeo, groundMaterial);
ground.rotateX(-Math.PI/2);
// ground.translateZ(-10);
scene.add(ground);

// To add a Sky:
//var skyGeo = new SphereBufferGeometry( 400, 32, 15 );
//var skyMat = new MeshBasicMaterial();
//skyMat.color = new Color(0x3344dd);
//skyMat.side = DoubleSide;
//var sky = new Mesh( skyGeo, skyMat );
//scene.add( sky );

const t_max = 3;
const dt = 0.01;
const times = Array(Math.ceil(t_max/dt)).fill(0).map((_,i) => dt*i);
const dropheight = 10;
const fallInAnimation = ((nodeName:string, x0:number, y0:number, z0:number): AnimationClip => {
    const position = (t:number) => new Vector3(
        x0,
        y0 + dropheight *(1 - Math.pow(t/t_max,2)),
        z0
    );
    return new AnimationClip("Fall In", -1,[
        new NumberKeyframeTrack(`${nodeName}.position`, times, times.map(position))
    ]);
});

const lines = stackPositions.split("\n").slice(0,-1);
// console.log(lines);
const cubeCoords = lines.reduce((prevPositions: Array<{x:number, z:number}>, newLine, lineNumber) =>
    prevPositions.concat(newLine.split('')
    .map((char, colNumber)=>({c:char, x:colNumber, z:lineNumber}))
    .filter(x => x.c === "#")
    .map(o => ({x:o.x, z:o.z}))), []);
console.log(cubeCoords);

const cubesAndStartTimes: Array<[Mesh, number]> = cubeCoords.map((coordPair, i) => {
    const c = new Mesh(cubeGeo, greenStuff);
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
        const textMat = new MeshStandardMaterial();
        textMat.color = new Color(0xffffff);
        textMat.depthWrite = false;
        textMat.dithering = true;
        const text = new Mesh(textGeometry, textMat);
        text.scale.set(0.0015,0.0015,0.0015);
        text.position.setZ(0.36);
        text.position.setX(-0.35);
        text.position.setY(0.1);
        c.add(text);
    }

    return [c, i];
});
const mixers = cubesAndStartTimes.map(cubeAndStartTime => {
    const cube = cubeAndStartTime[0];
    const startTime = cubeAndStartTime[1];
    const mixer = new AnimationMixer(cube);
    const animation = fallInAnimation(cube.name, cube.position.x,cube.position.y, cube.position.z);
    const animationAction = mixer.clipAction(animation);
    animationAction.setLoop(LoopOnce,1);
    animationAction.clampWhenFinished = true;
    animationAction.play();
    animationAction.startAt(startTime);
    return mixer;
});
scene.add(...cubesAndStartTimes.map(x=>x[0]));
scene.add( ambientLight );
scene.add( hemisphereLight );

camera.position.set(50,50,30);
camera.lookAt(50,0,0);

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 100 );
document.body.appendChild( renderer.domElement );
const clock = new Clock();
const animate = function () {
    let dt = clock.getDelta();
    let t = clock.getElapsedTime();
    mixers.forEach(mixer => {
        mixer.update(dt);
    });
    camera.lookAt(50+3*Math.sin(t/2),3*Math.cos(t/2),10);
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();
