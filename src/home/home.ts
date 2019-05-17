import '../style.css';
import './style.css';
import {
    Scene, PerspectiveCamera, PointLight, BoxGeometry, Mesh,
    Font, TextGeometry, MeshLambertMaterial, WebGLRenderer, AnimationClip, KeyframeTrack,
    NumberKeyframeTrack, Clock, AnimationMixer, LoopPingPong, LoopOnce
} from 'three';
let stacks: Array<{
    name:string, position:{x:number,y:number, z:number},
    startTime: number
}> = require('../animation_data/stacks.json');
let fontJSON = require("../../node_modules/three/examples/fonts/helvetiker_regular.typeface.json");
let scene = new Scene();
let camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let pointLight = new PointLight("white", 1, 100);
let font = new Font(fontJSON);
pointLight.position.set(0,20,20);

let geo = new BoxGeometry(0.6, 0.6,0.6);
let mat = new MeshLambertMaterial();
let greenHex = 0x11aa22
mat.color.set(greenHex);

let times = Array(3).fill(0).map((_,i)=>i);
let fallInAnimation = ((nodeName:string, x0:number, y0:number, z0:number): AnimationClip => {
    let x_of_t = (t:number):number => {
        return x0 + t;
    };
    let y_of_t = (t:number):number =>{
        return y0 + t;
    };
    let z_of_t = (t:number):number => {
        return z0 + t;
    };
    return new AnimationClip("Fall In", -1,[
        new NumberKeyframeTrack(`${nodeName}.position[x]`, times, times.map(x_of_t)),
        new NumberKeyframeTrack(`${nodeName}.position[y]`,times,times.map(y_of_t)),
        new NumberKeyframeTrack(`${nodeName}.position[z]`, times, times.map(z_of_t)),
    ]);
});
let cubesAndStartTimes: Array<[Mesh, number]> = stacks.map((stack, i) => {
    let c = new Mesh(geo, mat);
    c.name = `box${i}`;
    c.position.x = stack.position.x;
    c.position.y = stack.position.y;
    c.position.z = stack.position.z;
    let textGeometry = new TextGeometry(stack.name, {
        font: font,
        size: 100,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelSegments: 5
    });
    let textMat = new MeshLambertMaterial();
    let text = new Mesh(textGeometry, textMat);
    text.scale.set(0.001,0.001,0.001);
    text.position.setZ(0.35);
    text.position.setX(-0.20);
    c.add(text);

    return [c, stack.startTime];
});
let mixers = cubesAndStartTimes.map(cubeAndStartTime => {
    let cube = cubeAndStartTime[0];
    let startTime = cubeAndStartTime[1];
    let mixer = new AnimationMixer(cube);
    let animation = fallInAnimation(cube.name, cube.position.x,cube.position.y, cube.position.z);
    let animationAction = mixer.clipAction(animation);
    animationAction.play();
    animationAction.startAt(startTime);
    animationAction.setLoop(LoopOnce,1);
    return mixer;
});
scene.add(...cubesAndStartTimes.map(x=>x[0]));
scene.add(pointLight);

camera.position.set(1.5,1.5,4);
camera.lookAt(1.5,1.5,0);

let renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 110 );
document.body.appendChild( renderer.domElement );
let clock = new Clock();
let animate = function () {
    let dt = clock.getDelta();
    mixers.forEach(mixer => {
        mixer.update(dt);
    });
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
};

animate();
