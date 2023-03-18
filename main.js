import * as THREE from 'three';
import { Scene, Raycaster } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as dat from "dat.gui"
import gsap from 'gsap';


const gui = new dat.GUI()
const scene = new Scene();
const raycaster = new Raycaster();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const light = new THREE.DirectionalLight(0xffffff, 1)

const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild( renderer.domElement );

light.position.set(0.5, 1, 1)
scene.add( light )

const changeVertices = (plane) => {
  const { array: planeVertices } = plane.geometry.attributes.position

  for (let i = 0; i < planeVertices.length; i += 3) {
    const x = planeVertices[i]
    const y = planeVertices[i+1]
    const z = planeVertices[i+2]

    planeVertices[i] = x + (Math.random() - 0.5) * 2.5
    planeVertices[i+1] = y + (Math.random() - 0.5) * 3
    planeVertices[i+2] = z + (Math.random() - 0.5) * 10
  }
}

const animateVertices = (plane, frame) => {
  plane.geometry.attributes.position.originalPosition = plane.geometry.attributes.position.array
  const { array: planeVertices, originalPosition } = plane.geometry.attributes.position

  for (let i = 0; i < planeVertices.length; i += 3) {
    const randomXValue = Math.random() - 0.5
    const randomYValue = Math.random() - 0.5
    const randomZValue = Math.random() - 0.5
    planeVertices[i] = originalPosition[i] + Math.cos(frame + randomXValue)*0.003
    planeVertices[i+1] = originalPosition[i+1] + Math.cos(frame + randomYValue)*0.01
    planeVertices[i+2] = originalPosition[i+2] + Math.cos(frame - randomZValue)*0.001
  }

  plane.geometry.attributes.position.needsUpdate = true

 
}

const generatePlane = (plane) => {
  plane.geometry.dispose()
  plane.geometry = new THREE.PlaneGeometry( 
    world.plane.width, 
    world.plane.height, 
    world.plane.widthSegments,
    world.plane.heightSegments
  );
  changeVertices(plane)
  changePlaneColor(plane)
}

const changePlaneColor = (plane) => {
  const verticeColors = []
  for (let i = 0; i < plane.geometry.attributes.position.count; i++) {
    verticeColors.push(world.plane.R, world.plane.G, world.plane.B)
  }
  plane.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(verticeColors), 3))
}



// init plane
const initialVertexColors = {
  R: 0,
  G: 0.19,
  B: 0.4
}
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50, 
    heightSegments: 50,
    R: 0,
    G: 0.19,
    B: 0.4
  }
}
const planeGeometry = new THREE.PlaneGeometry( 
  world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments
  );
const planeMaterial = new THREE.MeshPhongMaterial({
  vertexColors:true,
  reflectivity: 1,
  refractionRatio: 0.5,
  shininess: 50, 
  flatShading: true
});
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
changeVertices(plane)
changePlaneColor(plane)


// dat gui

gui.add(world.plane, 'width', 1, 1000)
  .onChange(() => generatePlane(plane))
gui.add(world.plane, 'height', 1, 1000)
.onChange(() => generatePlane(plane))
gui.add(world.plane, 'widthSegments', 1, 100)
  .onChange(() => generatePlane(plane))
gui.add(world.plane, 'heightSegments', 1, 100)
.onChange(() => generatePlane(plane))
gui.add(world.plane, 'R', 0, 1)
.onChange(() => changePlaneColor(plane))
gui.add(world.plane, 'G', 0, 1)
.onChange(() => changePlaneColor(plane))
gui.add(world.plane, 'B', 0, 1)
.onChange(() => changePlaneColor(plane))



scene.add( plane );


camera.position.z = 50;
const mouse = {
  x: undefined,
  y: undefined
}


let frame = 0
function animate() {
	requestAnimationFrame( animate );

  frame += 0.01

  animateVertices(plane, frame)

  

	renderer.render( scene, camera );

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(plane)
  if(intersects.length > 0) {
    const face = intersects[0].face
    const { color } = intersects[0].object.geometry.attributes
    
    const hoverVertexColors = {
      R: 1,
      G: 0.5,
      B: 1
    }
    
    // vertex 1
    color.setX(face.a, hoverVertexColors.R)
    color.setY(face.a, hoverVertexColors.G)
    color.setZ(face.a, hoverVertexColors.B)
    // vertex 2
    color.setX(face.b, hoverVertexColors.R)
    color.setY(face.b, hoverVertexColors.G)
    color.setZ(face.b, hoverVertexColors.B)
    // vertex 3
    color.setX(face.c, hoverVertexColors.R)
    color.setY(face.c, hoverVertexColors.G)
    color.setZ(face.c, hoverVertexColors.B)

    color.needsUpdate = true

    gsap.to(hoverVertexColors, {
      R: initialVertexColors.R,
      G: initialVertexColors.G,
      B: initialVertexColors.B,
      duration: 1,
      onUpdate: () =>  {
        // vertex 1
        color.setX(face.a, hoverVertexColors.R)
        color.setY(face.a, hoverVertexColors.G)
        color.setZ(face.a, hoverVertexColors.B)
        // vertex 2
        color.setX(face.b, hoverVertexColors.R)
        color.setY(face.b, hoverVertexColors.G)
        color.setZ(face.b, hoverVertexColors.B)
        // vertex 3
        color.setX(face.c, hoverVertexColors.R)
        color.setY(face.c, hoverVertexColors.G)
        color.setZ(face.c, hoverVertexColors.B)

        color.needsUpdate = true
      }
    })

    
  }
}

animate();



// event listeners
addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = 1 - (event.clientY / innerHeight) * 2

})