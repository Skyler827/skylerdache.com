import '../style.css';
import './style.css';
import {
    Scene, PerspectiveCamera, PointLight, BoxGeometry, Mesh,
    Font, TextGeometry, MeshLambertMaterial, WebGLRenderer, AnimationClip, KeyframeTrack,
    NumberKeyframeTrack, Clock, AnimationMixer, LoopPingPong, LoopOnce, AmbientLight, PlaneGeometry, 
    MeshPhongMaterial, MeshStandardMaterial, Color, HemisphereLight, MeshBasicMaterial, SphereBufferGeometry, BackSide, DoubleSide, Vector3, VectorKeyframeTrack
} from 'three';
const stackPositions: string = require("../animation_data/stackPositions.txt").default;

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const hemisphereLight = new HemisphereLight( 0xffffbb, 0x080820, 1 );
const ambientLight = new AmbientLight( 0xaaaaaa ); // soft white light

const cubeGeo = new BoxGeometry(0.7, 0.5, 0.7);
const greenStuff = new MeshLambertMaterial();
const greenHex = 0x11aa22
greenStuff.color.setHex(greenHex);
const groundGeo = new PlaneGeometry(150,30);
const groundMaterial = new MeshLambertMaterial();
groundMaterial.color.setHex(0x4a2233);
const ground = new Mesh(groundGeo, groundMaterial);
ground.rotateX(-Math.PI/2);
ground.translateY(-6);
ground.translateX(68);
console.log(ground.position);

scene.add(ground);

const t_max = 3;
const dt = 0.1;
const times = Array(Math.ceil(t_max/dt)).fill(0).map((_,i) => dt*i);
const dropheight = 50;
const secondLineCutoff = 8;
const secondLineDelay = 12;
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
function hash(p:p):number {
    return Math.pow(p.x + p.z, 100) % 1151;
}
cubeCoords.sort((a,b) => {
    if (a.z < secondLineCutoff && b.z >= secondLineCutoff) return -1
    else if (a.z >= secondLineCutoff && b.z < secondLineCutoff) return 1;
    else if (a.z >= secondLineCutoff && b.z >= secondLineCutoff) return hash(a) - hash(b);
    else return distance(a,startingPoint) - distance(b, startingPoint)
});

const cubesAndStartTimes: Array<[Mesh, AnimationMixer]> = cubeCoords.map((coordPair, i) => {
    const c = new Mesh(cubeGeo, greenStuff);
    const startTime = coordPair.z < secondLineCutoff ? Math.sqrt(i) : secondLineDelay+i/70;
    c.name = `box${i}`;
    c.position.set(coordPair.x, dropheight, coordPair.z);


    const mixer = new AnimationMixer(c);
    const animation = fallInAnimation(c.name, c.position);
    const animationAction = mixer.clipAction(animation);
    animationAction.setLoop(LoopOnce,1);
    animationAction.clampWhenFinished = true;
    animationAction.play();
    animationAction.startAt(startTime);
    return [c, mixer];
});

const cubes = cubesAndStartTimes.map(x=>x[0]);
const mixers = cubesAndStartTimes.map(x=>x[1]);
scene.add(...cubes);
scene.add( ambientLight );
scene.add( hemisphereLight );

camera.position.set(50,50,50);
camera.lookAt(50,0,0);

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 100 );
document.body.appendChild( renderer.domElement );
const clock = new Clock();
const animate = function () {
    let dt = clock.getDelta();
    let t = clock.getElapsedTime();
    mixers.forEach((mixer, i) => {
        mixer.update(dt);
    });
    camera.lookAt(50+3*Math.sin(t/2),3*Math.cos(t/2),10);
    // ground.rotateZ(dt);
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();
