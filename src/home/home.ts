import '../style.css';
import './style.css';
import {
    Scene, PerspectiveCamera, PointLight, BoxGeometry, Mesh,
    Font, TextGeometry, MeshLambertMaterial, WebGLRenderer, AnimationClip, KeyframeTrack,
    NumberKeyframeTrack, Clock, AnimationMixer, LoopPingPong, LoopOnce, AmbientLight, PlaneGeometry, 
    MeshPhongMaterial, MeshStandardMaterial, Color, HemisphereLight, MeshBasicMaterial, SphereBufferGeometry, BackSide, 
    DoubleSide, Vector3, VectorKeyframeTrack, QuaternionKeyframeTrack, Side, Quaternion
} from 'three';

const sin = Math.sin;
const pow = Math.pow;
const sqrt = Math.sqrt;

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
const groundMaterial = new MeshLambertMaterial({side: DoubleSide});
groundMaterial.color.setHex(0x4a2233);
const ground = new Mesh(groundGeo, groundMaterial);
ground.rotateX(-Math.PI/2);
ground.translateY(-6);
ground.translateX(68);
ground.translateZ(3.5);

scene.add(ground);

const t_max = 4;
const dt = 0.1;
const times = Array(Math.ceil(t_max/dt)).fill(0).map((_,i) => dt*i);
const dropheight = 80;
const secondLineCutoff = 8;
const secondLineDelay = 12;
const fallInAnimation = ((p0:Vector3): AnimationClip => {
    function position(t:number) {
        return [p0.x, p0.y -dropheight * pow(t/t_max,2), p0.z];
    }
    return new AnimationClip("Fall In", -1,[
        new VectorKeyframeTrack(`.position`, times, times.flatMap(position))
    ]);
});

const lines = stackPositions.split("\n").slice(0,-1);
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
    return sqrt(pow(a.x-b.x,2)+pow(a.z-b.z,2));
}
const startingPoint:p = {x:6,z:-4};
function hash(p:p):number {
    return pow(p.x + p.z, 100) % 1151;
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
    const animation = fallInAnimation(c.position);
    const animationAction = mixer.clipAction(animation);
    animationAction.setLoop(LoopOnce,1);
    animationAction.clampWhenFinished = true;
    animationAction.play();
    animationAction.startAt(startTime);
    return [c, mixer];
});

scene.add( ambientLight );
scene.add( hemisphereLight );

camera.position.set(50,50,50);
camera.lookAt(50,0,0);
function quaternionArray(x:number, y:number, z:number):number[] {
    let quat = new Quaternion().setFromUnitVectors(
        new Vector3(0,0,-1),
        new Vector3(x,y,z).normalize());
    return quat.toArray();
}
const cameraMaxTime = 8*Math.PI;
const cameraDt = 0.1;
const cameraTimes = Array(Math.ceil(cameraMaxTime/cameraDt)).fill(0).map((_,i) => cameraDt*i);
const cameraMixer = new AnimationMixer(camera);
const cameraPan = new AnimationClip("camera_pan",-1, [
    new VectorKeyframeTrack(".position", Array.from(Array(15).keys()).concat([15.71]), [
        //x, y,  z:
        3,   4,  15, //t=0
        3,   4,  7,  //t=1
        3,   4,  7,  //t=2
        3,   4,  7,  //t=3
        3.5, 4,  7,  //t=4
        3.5, 4,  7,  //t=5
        3.5, 4,  7,  //t=6
        3.5, 4,  7,  //t=7
        20,  9,  9,  //t=8
        20,  9,  9,  //t=9
        20,  9,  9,  //t=10
        15,  20, 17, //t=11
        15,  20, 17, //t=12
        15,  20, 17, //t=13
        55,  50, 50, //t=14
        55,  50, 50, //t=15
        55,  50, 50  //t=15.708 (~5pi)
    ]),
    new QuaternionKeyframeTrack(".quaternion", Array.from(Array(15).keys()).concat([15.71]),[
        //direction camera is
        quaternionArray(0,-0.2,-0.9),   //t=0
        quaternionArray(0,-0.2,-0.9),   //t=1
        quaternionArray(0,-0.3,-0.9),   //t=2
        quaternionArray(0,-0.3,-0.9),   //t=3
        quaternionArray(0,-0.3,-0.9),   //t=4
        quaternionArray(0.7,-0.1,-0.2), //t=5
        quaternionArray(0.7,-0.1,-0.2), //t=6
        quaternionArray(0.7,-0.1,-0.2), //t=7
        quaternionArray(-0.3,0,-0.6),   //t=8
        quaternionArray(-0.3,0,-0.6),   //t=9
        quaternionArray(-0.3,0,-0.6),   //t=10
        quaternionArray(0,-0.4,-0.8),   //t=11
        quaternionArray(0,-0.4,-0.8),   //t=12
        quaternionArray(0,-0.4,-0.8),   //t=13
        quaternionArray(0,-0.4,-0.8),   //t=14
        quaternionArray(0,-0.4,-0.8),   //t=15
        quaternionArray(0,-0.4,-0.8)    //t=15.708 (~5pi)
    ].flat())
]);
const cameraPanLoop = new AnimationClip("camera_pan_loop", -1, [
    new VectorKeyframeTrack(".position", cameraTimes, cameraTimes.flatMap(t => 
        // x, y, z:
        [55, 50+3*sin(3*t), 50]
    )),
    new QuaternionKeyframeTrack(".quaternion", cameraTimes, cameraTimes.flatMap(t =>
        quaternionArray(0,-1-0.05*sin(3*t),-2)
    ))
]);
const cameraPanAction = cameraMixer.clipAction(cameraPan);
const cameraPanLoopAction = cameraMixer.clipAction(cameraPanLoop);
cameraPanAction.play();
cameraPanAction.repetitions = 1;
cameraMixer.addEventListener('finished', function(e) {
    // const prevClipName = e.action._clip.name;
    // console.log(e);
    // console.log(prevClipName);
    cameraPanLoopAction.play();
});
const cubes = cubesAndStartTimes.map(x=>x[0]);
const mixers = cubesAndStartTimes.map(x=>x[1]).concat([cameraMixer]);
scene.add(...cubes);

const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 100 );
document.body.appendChild( renderer.domElement );
const clock = new Clock();
let prevTime = 0;
const animate = function () {
    let dt = clock.getDelta();
    let t = clock.getElapsedTime();
    mixers.forEach((mixer, i) => {
        mixer.update(dt);
    });
    prevTime = t;
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();
