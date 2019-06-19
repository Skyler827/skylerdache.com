import '../style.css';
import './style.css';
import {
    Scene, PerspectiveCamera, BoxGeometry, Mesh,
    MeshLambertMaterial, WebGLRenderer, AnimationClip, Clock, AnimationMixer, LoopOnce, AmbientLight, PlaneGeometry, 
    HemisphereLight, DoubleSide, Vector3, VectorKeyframeTrack, QuaternionKeyframeTrack, Quaternion
} from 'three';
const stackNames:{
    "OSs":{
        "name":string,
        "img":string,
        "versions": number[]
    }[],
    "system-tools":{
        "name":string,
        "os":string
    }[],
    "shell-utilities":{
        "name":string,
        "os":string
    }[],
    "editors":{
        "name":string,
        "img":string
    }[],
    "languages":{
        "name":string,
        "img":string,
        "usable-as":string[]
    }[],
    "frameworks":{
        "name":string,
        "language":string,
        "img":string
        "type": "web-backend" | "web-frontend" | "desktop" | "mobile"
    }[],
    "databases": {
        "name":string,
        "img":string,
        "architecture":"client only" | "client-server",
        "model": "relational" | "non-relational",
        "license": "open source" | "proprietary"
    }[]
} = require("../animation_data/stackNames.json");
const sin = Math.sin;
const pow = Math.pow;
const sqrt = Math.sqrt;

const stackPositions: string = require("../animation_data/stackPositions.txt").default;
const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const hemisphereLight = new HemisphereLight( 0xffffbb, 0x080820, 1 );
const ambientLight = new AmbientLight( 0xaaaaaa ); // soft white light

const cubeGeo = new BoxGeometry(0.7, 0.5, 0.7);
const cubeMaterial = new MeshLambertMaterial();
const darkGreyHex = 0x332255;
const greyHex = 0x665588;
cubeMaterial.color.setHex(greyHex);
const groundGeo = new PlaneGeometry(150,30);
const groundMaterial = new MeshLambertMaterial({side: DoubleSide});
groundMaterial.color.setHex(darkGreyHex);
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
function cubeAndMixer(
    coordPair:{x:number,z:number},coordIdx:number,height:number,techName:string, techImg:string
): [Mesh, AnimationMixer] {
    const c = new Mesh(cubeGeo, cubeMaterial);
    const startTime = coordPair.z < secondLineCutoff ?
        Math.sqrt(coordIdx) + height/2:
        secondLineDelay+coordIdx/70 + height/2;
    c.name = `box${coordIdx}.${height}`;
    c.position.set(coordPair.x, dropheight+height, coordPair.z);
    const mixer = new AnimationMixer(c);
    const animation = fallInAnimation(c.position);
    const animationAction = mixer.clipAction(animation);
    animationAction.setLoop(LoopOnce,1);
    animationAction.clampWhenFinished = true;
    animationAction.play();
    animationAction.startAt(startTime);
    return [c, mixer];
}
const cubesAndStartTimes: Array<[Mesh, AnimationMixer]> = cubeCoords.flatMap((coordPair, i) => {
    let randomOS = stackNames.OSs[Math.floor(Math.random()*stackNames.OSs.length)];
    let randomLang = stackNames.languages[Math.floor(Math.random()*stackNames.languages.length)];
    let additionalTechs = Math.floor(Math.random()*4);
    let techStack = [randomOS,randomLang];
    for (let i=0; i<additionalTechs; i++) {
        const snk = Object.keys(stackNames);
        const randomType = snk[Math.random()*snk.length]
        const randomTech = stackNames[randomType[Math.random()*randomType.length]];
        techStack.push(randomTech);
    }
    return Array.from({length: 3}, (_, k) => k).map(v => cubeAndMixer(coordPair,i,v/2,"",""));
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
    new VectorKeyframeTrack(".position", Array.from(Array(16).keys()).concat([15.708]), [
        //camera position:
        //x, y,  z:
        3,   4,  15,  //t=0
        3,   4,  7,   //t=1
        3,   4,  7,   //t=2
        3,   4,  7,   //t=3
        3.5, 4,  7,   //t=4
        3.5, 4,  7,   //t=5
        3.5, 4,  7,   //t=6
        3.5, 4,  7,   //t=7
        20,  9,  9,   //t=8
        20,  9,  9,   //t=9
        20,  9,  9,   //t=10
        15,  20, 17,  //t=11
        15,  20, 17,  //t=12
        15,  20, 17,  //t=13
        55,  50, 50,  //t=14
        60,  50, 42.5,//t=15
        65,  50, 35   //t=15.708 (~5pi)
    ]),
    new QuaternionKeyframeTrack(".quaternion", Array.from(Array(16).keys()).concat([15.708]),[
        // direction camera is facing (not normalized)
        quaternionArray(0,0.7,-0.4),    //t=0
        quaternionArray(0,0.7,-0.4),    //t=1
        quaternionArray(0,0.7,-0.4),    //t=2
        quaternionArray(0,0.7,-0.4),    //t=3
        quaternionArray(0,0.7,-0.4),    //t=4
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
        quaternionArray(0,-1.2,-1),     //t=15
        quaternionArray(0,-2,-1.2)      //t=15.708 (~5pi seconds)
    ].flat())
]);
const cameraPanLoop = new AnimationClip("camera_pan_loop", -1, [
    new VectorKeyframeTrack(".position", cameraTimes, cameraTimes.flatMap(t => 
        // x, y, z:
        [65, 50+3*sin(3*t), 35]
    )),
    new QuaternionKeyframeTrack(".quaternion", cameraTimes, cameraTimes.flatMap(t =>
        quaternionArray(0,-2-0.05*sin(3*t),-1.2)
    ))
]);
const cameraPanAction = cameraMixer.clipAction(cameraPan);
const cameraPanLoopAction = cameraMixer.clipAction(cameraPanLoop);

cameraPanAction.play();
cameraPanAction.repetitions = 1;

cameraMixer.addEventListener('finished', function() {
    cameraPanLoopAction.play();
});
const cubes = cubesAndStartTimes.map(x=>x[0]);
const mixers = cubesAndStartTimes.map(x=>x[1]).concat([cameraMixer]);
scene.add(...cubes);
const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 100 );
document.body.appendChild( renderer.domElement );
const clock = new Clock();
const animate = function () {
    let dt = clock.getDelta();
    mixers.forEach((mixer) => {
        mixer.update(dt);
    });
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();
