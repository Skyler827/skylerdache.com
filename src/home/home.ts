import '../style.css';
import './style.css';
import {
    Scene, PerspectiveCamera, PointLight, BoxGeometry, Mesh,
    Font, TextGeometry, MeshLambertMaterial, WebGLRenderer, AnimationClip, KeyframeTrack,
    NumberKeyframeTrack, Clock, AnimationMixer, LoopPingPong, LoopOnce, AmbientLight, PlaneGeometry, 
    MeshPhongMaterial, MeshStandardMaterial, Color, HemisphereLight, MeshBasicMaterial, SphereBufferGeometry, BackSide, DoubleSide, Vector3, VectorKeyframeTrack
} from 'three';
import { Z_ASCII } from 'zlib';
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
// scene.add(ground);

// To add a Sky:
//var skyGeo = new SphereBufferGeometry( 400, 32, 15 );
//var skyMat = new MeshBasicMaterial();
//skyMat.color = new Color(0x3344dd);
//skyMat.side = DoubleSide;
//var sky = new Mesh( skyGeo, skyMat );
//scene.add( sky );

const t_max = 3;
const dt = 0.1;
const times = Array(Math.ceil(t_max/dt)).fill(0).map((_,i) => dt*i);
const dropheight = 50;
const secondLineCutoff = 8;
const secondLineDelay = 1.5;
function validPosition(v:any) {
    return (v.x!=null) && (v.y!=null) && (v.z!=null);
}
const fallInAnimation = ((nodeName:string, p0:Vector3): AnimationClip => {
    function position(t:number) {
        return [p0.x, p0.y -dropheight * Math.pow(t/t_max,2), p0.z];
    }
    return new AnimationClip("Fall In", -1,[
        new VectorKeyframeTrack(`${nodeName}.position`, times, times.flatMap(position))
    ]);
});

const lines = stackPositions.split("\n").slice(0,-1);
// console.log(lines);
const cubeCoords = lines.flatMap((newLine, lineNumber) =>
    newLine.split('')
    .map((char, columnNumber) =>
    char == '#' ? ({
        x: columnNumber,
        z: lineNumber
    }): null))
    .filter(o => o);

type p = {x:number, z:number};
function distance(a:p,b:p) {
    return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.z-b.z,2));
}
const startingPoint:p = {x:6,z:-4};
cubeCoords.sort((a,b) => {
    if (a.z < secondLineCutoff && b.z >= secondLineCutoff) return -1
    else if (a.z >= secondLineCutoff && b.z < secondLineCutoff) return 1;
    else return distance(a,startingPoint) - distance(b, startingPoint)
});

const cubesAndStartTimes: Array<[Mesh, number, AnimationMixer]> = cubeCoords.map((coordPair, i) => {
    const c = new Mesh(cubeGeo, greenStuff);
    const startTime = Math.sqrt(i) + (coordPair.z > secondLineCutoff ? secondLineDelay:0);
    c.name = `box${i}`;
    c.position.set(coordPair.x, dropheight, coordPair.z);
    if (!validPosition(c.position)) {
        console.error("invalid initial position");
    }


    const mixer = new AnimationMixer(c);
    if (!validPosition(c.position)) {
        console.error("invalid position @107");
    }
    const animation = fallInAnimation(c.name, c.position);
    const animationAction = mixer.clipAction(animation);
    animationAction.setLoop(LoopOnce,1);
    animationAction.clampWhenFinished = true;
    animationAction.play();
    animationAction.startAt(startTime);
    return [c, i, mixer];
});

const cubes = cubesAndStartTimes.map(x=>x[0]);
const mixers = cubesAndStartTimes.map(x=>x[2]);
scene.add(...cubes);
scene.add( ambientLight );
scene.add( hemisphereLight );

camera.position.set(50,50,50);
camera.lookAt(50,0,0);

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 100 );
document.body.appendChild( renderer.domElement );
const clock = new Clock();
let nextPrint:number = 0;
const middleCube = cubesAndStartTimes[Math.floor(cubesAndStartTimes.length/2)][0];
const animate = function () {
    let dt = clock.getDelta();
    let t = clock.getElapsedTime();
    mixers.forEach((mixer, i) => {
        mixer.update(dt);
        // if (i==0) console.log(mixer.getRoot().position);
    });
    camera.lookAt(50+3*Math.sin(t/2),3*Math.cos(t/2),10);
    // camera.lookAt(middleCube.position);
    if (t > nextPrint) {
        console.log("middle cube position:");
        console.log(middleCube.position);
        console.log("camera position:");
        console.log(camera.position);
        nextPrint += 10;
    }
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();
