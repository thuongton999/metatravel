import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

const loading = document.getElementById("loading");
const canvas = document.getElementById("webglOutput");
const switch_button = document.getElementById("switch_button");
const aspect = window.innerWidth / window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const models = await fetch("https://thuongton999.github.io/metatravel/models/models.json").then(res => res.json());
let current_model = null;
let current_box = null;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(new THREE.Color(0x464646));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

function render() {
    renderer.render(scene, camera);
}
function onResize() {
    let newAspect = window.innerWidth / window.innerHeight;
    camera.aspect = newAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
window.addEventListener("resize", onResize);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

function loadModel(model) {
    const onProgress = (xhr) => {if (xhr.loaded / xhr.total) loading.setAttribute("disable", true);};
    const materialLoader = new MTLLoader();

    materialLoader.load(
        model.material,
        (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(
                model.object,
                (object) => {
                    object.name = model.name;
                    object.position.set(0, 0, 0);
                    const box = new THREE.BoxHelper(object, 0xFFFFFF);
                    current_model = object;
                    current_box = box;
                    scene.add(object);
                    scene.add(box);
                },
                onProgress
            );
        },
        onProgress
    )
}

const color = 0xffffff;
const intensity = 1.8;
const ambientLight = new THREE.AmbientLight(color, intensity);

camera.position.set(0, 20, 30);
camera.lookAt(scene.position);

scene.add(ambientLight);

let counter = 0;
function switchModel() {
    loading.removeAttribute("disable");
    if (current_model) {
        scene.remove(current_model);
        scene.remove(current_box);
    }
    loadModel(models[counter]);
    counter = (counter+1) % 3;
}

switch_button.addEventListener("click", switchModel);

function animate() {
    requestAnimationFrame(animate);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
    render(scene, camera);
}


switchModel()
animate()
