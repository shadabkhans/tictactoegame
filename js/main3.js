import * as THREE from "three";
//import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* import { LineSegments2 } from "../lines/LineSegments2.js";
import { LineGeometry } from "../lines/LineGeometry.js";
import { LineMaterial } from "../lines/LineMaterial.js"; */
const currentWidth = 400; //window.innerWidth; //1920;
const currentHeight = 600; //window.innerHeight; //700;

let scene, camera, renderer;
const canvas_width = currentWidth;
const canvas_height = currentHeight;
const aspectRatio = currentWidth / currentHeight;
let chipsArrayPos = [];
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(
  75,
  canvas_width / canvas_height,
  0.1,
  1000
);
camera.position.z = 4;

const cube_width = 0.9;
const cube_height = 0.9;

renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(currentWidth, currentHeight);

const container = document.querySelector("#threejs-container");
container.append(renderer.domElement);

gsap.registerPlugin(CSSPlugin);

let master_group = new THREE.Group();
let chip_main_group = new THREE.Group();
scene.add(master_group);
//logic data
let currentPlayer = "X";
let wins = 0;
let losses = 0;
let ties = 0;
let gameOver = false;
let boxArray = [null, null, null, null, null, null, null, null, null];

let difficultySelect;
document.addEventListener("DOMContentLoaded", () => {
  difficultySelect = document.getElementById("difficulty");
});

function getTextTexture(prefix, txt, myx, myy) {
  //alert(txt);
  // console.log("txt", txt, " ", txt % 1000);

  var canvas_text = document.createElement("canvas");
  var ctx = canvas_text.getContext("2d");
  canvas_text.width = 300;
  canvas_text.height = 300;

  var texture = new THREE.Texture(canvas_text);
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
  });
  material.map.minFilter = THREE.LinearFilter;

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.colorSpace = THREE.SRGBColorSpace;

  // Create a mesh with the dynamic text
  var geometry = new THREE.PlaneGeometry(3, 3);
  var mesh = new THREE.Mesh(geometry, material);

  var dynamicText = prefix + " " + txt; //+ ${counter++};

  ctx.clearRect(0, 0, canvas_text.width, canvas_text.height);

  ctx.font = "bold 18px Arial";

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(dynamicText, canvas_text.width / 2, canvas_text.height / 2);

  texture.needsUpdate = true;
  mesh.position.x = myx;
  mesh.position.y = myy;
  return mesh;
}
//win text for player
let textMeshArr1 = [];
function addText1(prefix, val) {
  removeAllMeshText(textMeshArr1);
  var chip_text_mesh = getTextTexture(prefix, val, 0, 0);

  chip_text_mesh.position.x = -1;
  chip_text_mesh.position.y = 2;
  scene.add(chip_text_mesh);
  textMeshArr1.push(chip_text_mesh);
}

//win text for computer
let textMeshArr2 = [];
function addText2(prefix, val) {
  removeAllMeshText(textMeshArr2);
  var chip_text_mesh = getTextTexture(prefix, val, 0, 0);

  chip_text_mesh.position.x = 1;
  chip_text_mesh.position.y = 2;
  scene.add(chip_text_mesh);
  textMeshArr2.push(chip_text_mesh);
}

//win text for Tie
let textMeshArr3 = [];
function addText3(prefix, val) {
  removeAllMeshText(textMeshArr3);
  var chip_text_mesh = getTextTexture(prefix, val, 0, 0);

  chip_text_mesh.position.x = 0;
  chip_text_mesh.position.y = 1.7;
  scene.add(chip_text_mesh);
  textMeshArr3.push(chip_text_mesh);
}

addText1("Wins:", "0");

addText2("Wins:", "0");

addText3("Tie:", "0");

// text for you won / lose / tie
let textMeshArr4 = [];
function addText4(prefix, val) {
  removeAllMeshText(textMeshArr4);
  var chip_text_mesh = getTextTexture(prefix, val, 0, 0);

  chip_text_mesh.position.x = 0;
  chip_text_mesh.position.y = -1.8;
  scene.add(chip_text_mesh);
  textMeshArr4.push(chip_text_mesh);
}

const gencube = (x, y, name) => {
  //let temp_group = new THREE.Group();
  //=================================   object 0
  const geometry = new THREE.PlaneGeometry(cube_width, cube_height);
  const material = new THREE.MeshBasicMaterial({
    color: 0x063970,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.userData.name = "box" + name;
  plane.position.x = x;
  plane.position.y = y;

  chip_main_group.add(plane);

  chipsArrayPos.push(plane);

  master_group.add(chip_main_group);
  //scene.add(cube11);
};

//row 1
gencube(-1, 1, "0");
gencube(0, 1, "1");
gencube(1, 1, "2");

//row 2
gencube(-1, 0, "3");
gencube(0, 0, "4");
gencube(1, 0, "5");

//row 3
gencube(-1, -1, "6");
gencube(0, -1, "7");
gencube(1, -1, "8");

function addText5(prefix, val) {
  var chip_text_mesh = getTextTexture(prefix, val, 0, 0);

  chip_text_mesh.position.x = 0;
  chip_text_mesh.position.y = -2.25;
  chip_text_mesh.position.z = 0.1;
  scene.add(chip_text_mesh);
}
function RestartButton() {
  addText5("Replay", "");
  // Create a 3D button (cube)
  const buttonGeometry = new THREE.BoxGeometry(1, 0.5, 0.1);
  const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x28a745 });
  let buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
  buttonMesh.userData.name = "mybuttonMesh";
  buttonMesh.position.set(0, -2.3, 0);
  scene.add(buttonMesh);
}
RestartButton();

window.addEventListener("resize", () => {
  renderer.setSize(currentWidth, currentHeight);
  camera.aspect = currentWidth / currentHeight;
  camera.updateProjectionMatrix();
});
//const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
  window.requestAnimationFrame(animate);
  //controls.update();
  renderer.render(scene, camera);
}
animate();

//=====================================================================================================================================================
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
document.addEventListener("click", onMeshClick, false);
//document.addEventListener("mousemove", onMouseMove);

function onMeshClick(event) {
  var rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children, true);

  for (var i = 0; i < intersects.length; i++) {
    var clickedMesh = intersects[i].object;
    if (clickedMesh.userData && clickedMesh.userData.name) {
      var meshName = clickedMesh.userData.name;
      console.log(meshName);
      if (meshName == "mybuttonMesh") {
        restartGame();
      } else {
        handle_box(clickedMesh, meshName);
      }

      break;
    }
  }
  /*  if (meshName != "chipset" && btn_main_group.visible == false) {
    hideChips();
  } */
}
function animate_scale(txt) {
  //let index = txt == "X" ? 0 : 1;

  gsap.to(header_meshes[0].scale, {
    x: 1.2,
    y: 1.2,
    z: 1,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    onComplete: () => {
      //textArray[i].visible = true; // Remove the mesh from the scene after the animation is complete
    },
  });

  gsap.to(header_meshes[1].scale, {
    x: 1.2,
    y: 1.2,
    z: 1,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    onComplete: () => {
      //textArray[i].visible = true; // Remove the mesh from the scene after the animation is complete
    },
  });
}

const header_meshes = [];
function header_func(txt) {
  let mesh_obj = txt == "genX" ? genXObject() : gen0Object();

  // mesh_obj = genXObject();
  mesh_obj.name = `obj${name}`;
  //mesh_obj.userData.name = "obj" + name;
  mesh_obj.position.x = txt == "genX" ? -1 : 1;
  mesh_obj.position.y = 2.6;
  mesh_obj.position.z = 0.01;

  //mesh_obj.material.opacity = 0.6;
  scene.add(mesh_obj);
  header_meshes.push(mesh_obj);
}
header_func("genX");
header_func("gen0");
header_func("genX");
header_func("gen0");
animate_scale("X");
animate_scale("0");
function handle_box(clickedMesh, obj_name) {
  let parts = obj_name.split("box");
  let number = parts[1];
  if (currentPlayer == "X") {
    handleCellThree(number);
  }
}
let flag = 0;
const meshes = [];
function addTopImage(x, y, name) {
  //let geometry1 = new THREE.PlaneGeometry(cube_width / 2, cube_height / 2);
  flag++;
  let mesh_obj;
  if (currentPlayer == "X") {
    mesh_obj = genXObject();
  } else {
    mesh_obj = gen0Object();
  }
  mesh_obj.name = `obj${name}`;
  //mesh_obj.userData.name = "obj" + name;
  mesh_obj.position.x = x;
  mesh_obj.position.y = y;
  mesh_obj.position.z = 0.01;
  scene.add(mesh_obj);
  meshes.push(mesh_obj);
}

function genXObject() {
  let temp_group = new THREE.Group();
  const geometry = new THREE.CapsuleGeometry(0.07, 0.5, 4, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  //mesh_obj.material.color.set("0xaaaaaa");

  const capsule1 = new THREE.Mesh(geometry, material);
  capsule1.rotation.z = Math.PI / 4;
  const capsule2 = new THREE.Mesh(geometry, material);
  capsule2.rotation.z = -Math.PI / 4;
  temp_group.add(capsule1);
  temp_group.add(capsule2);
  return temp_group;
}
function gen0Object() {
  const geometry1 = new THREE.TorusGeometry(2 / 10, 0.5 / 10, 8, 100);
  const material1 = new THREE.MeshBasicMaterial({ color: 0xf9f1f0 });

  let torusmesh = new THREE.Mesh(geometry1, material1);
  return torusmesh;
}

function handleCellThree(index) {
  //externalfunc("sk here");
  if (gameOver) return;

  //const index = event.target.dataset.index;
  //console.log(index); //0 to 8
  //console.log(boxArray);
  if (!boxArray[index]) {
    makeMove(index, currentPlayer);
    if (checkWin(currentPlayer)) {
      endGame(currentPlayer === "X" ? "win" : "loss");
    } else if (boxArray.every((cell) => cell !== null)) {
      endGame("tie");
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";

      if (currentPlayer === "O") {
        setTimeout(computerMove, 300);
      }
    }
  }
}

function computerMove() {
  const difficulty = difficultySelect.value;

  let index;
  if (difficulty === "easy") {
    index = easyMove();
  } else if (difficulty === "medium") {
    index = mediumMove();
  } else {
    index = hardMove();
  }

  makeMove(index, "O");
  if (checkWin("O")) {
    endGame("loss");
  } else if (boxArray.every((cell) => cell !== null)) {
    endGame("tie");
  } else {
    currentPlayer = "X";
  }
}

function easyMove() {
  const availableMoves = [];
  for (let i = 0; i < 9; i++) {
    if (boxArray[i] === null) {
      availableMoves.push(i);
    }
  }
  //console.log(availableMoves);

  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function mediumMove() {
  // Medium strategy: 50% random, 50% optimal
  return Math.random() > 0.5 ? easyMove() : hardMove();
}

function hardMove() {
  // Optimal strategy: Try to win or block opponent
  for (let i = 0; i < 9; i++) {
    if (boxArray[i] === null) {
      boxArray[i] = "O";
      if (checkWin("O")) {
        boxArray[i] = null;
        return i;
      }
      boxArray[i] = null;
    }
  }
  for (let i = 0; i < 9; i++) {
    if (boxArray[i] === null) {
      boxArray[i] = "X";
      if (checkWin("X")) {
        boxArray[i] = null;
        return i;
      }
      boxArray[i] = null;
    }
  }
  return easyMove();
}
function setInitHeaderAlpha(txt) {
  if (txt == "") {
    header_meshes[0].visible = false;
    header_meshes[1].visible = false;
    header_meshes[2].visible = true;
    header_meshes[3].visible = true;
  } else if (txt == "X") {
    header_meshes[0].visible = false;
    header_meshes[1].visible = true;
    header_meshes[2].visible = true;
    header_meshes[3].visible = false;
  } else {
    header_meshes[0].visible = true;
    header_meshes[1].visible = false;
    header_meshes[2].visible = false;
    header_meshes[3].visible = true;
  }
}
setInitHeaderAlpha("0");
function makeMove(index, player) {
  //threejs
  addTopImage(
    chipsArrayPos[index].position.x,
    chipsArrayPos[index].position.y,
    "112"
  );
  //
  console.log("===========" + player);
  setInitHeaderAlpha(player);

  //js
  boxArray[index] = player;
  ///const cell = document.querySelector(`.cell[data-index='${index}']`);
  ///cell.textContent = player;
  ///cell.classList.add("taken");
  //sk here only
}
let winIndexArr = [];

function checkWin(player) {
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (let combo of winningCombos) {
    let isWinningCombo = true;
    for (let index of combo) {
      if (boxArray[index] !== player) {
        isWinningCombo = false;
        break;
      } else {
        winIndexArr.push(index);
      }
    }
    if (isWinningCombo) {
      return true;
    }
    winIndexArr.length = 0;
  }
  return false;

  // return winningCombos.some((combo) =>
  //   combo.every((index) => boxArray[index] === player)
  // );
}
//addText1("Wins", "0");

//addText2("Wins", "0");

//addText3("Tie", "0");
let lastgamestatus = "";
function endGame(result) {
  gameOver = true;
  setInitHeaderAlpha("");
  //console.log(winIndexArr);
  if (result === "win") {
    lastgamestatus = "win";
    lineDraw();
    wins++;
    addText1("Wins", wins);
    addText4("You Won", "");
    //document.getElementById("wins").textContent = wins;
  } else if (result === "loss") {
    lastgamestatus = "loss";
    lineDraw();
    losses++;
    addText2("Wins", losses);
    addText4("You Lose", "");
    //document.getElementById("losses").textContent = losses;
  } else {
    lastgamestatus = "ties";
    ties++;
    addText3("Tie", ties);
    addText4("Match Tie", "");
    //document.getElementById("ties").textContent = ties;
  }
}

function lineDraw() {
  /* const lineGeometry = new LineGeometry();
  const positions = [];
  for (let i = 0; i < 3; i++) {
    console.log(winIndexArr[i]);
    // chipsArrayPos[index].position.x
    positions.push(
      chipsArrayPos[winIndexArr[i]].position.x,
      chipsArrayPos[winIndexArr[i]].position.y,
      chipsArrayPos[winIndexArr[i]].position.z
    );
  }
  lineGeometry.setPositions(positions);

  // Create LineMaterial with adjustable thickness
  const lineMaterial = new LineMaterial({
    color: 0xffffff,
    linewidth: 0.01, // Adjust this value for line thickness (world units)
    dashed: false,
  });

  lineMaterial.resolution.set(window.innerWidth, window.innerHeight); // Important for linewidth to work properly

  // Create the line and add it to the scene
  const line = new Line2(lineGeometry, lineMaterial);
  scene.add(line); */

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 10.1,
  });
  const lineGeometry = new THREE.BufferGeometry();

  // Extract positions of the meshes
  const positions = [];
  for (let i = 0; i < 3; i++) {
    console.log(winIndexArr[i]);
    // chipsArrayPos[index].position.x
    positions.push(
      chipsArrayPos[winIndexArr[i]].position.x,
      chipsArrayPos[winIndexArr[i]].position.y,
      chipsArrayPos[winIndexArr[i]].position.z
    );
  }

  // Set the positions as the vertices of the line geometry
  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  // Create the line and add it to the scene
  const line = new THREE.Line(lineGeometry, lineMaterial);

  scene.add(line);
  meshes.push(line);
}
function restartGame() {
  addText4("", "");
  winIndexArr.length = 0;
  removeAllMeshX0();
  boxArray.fill(null);
  gameOver = false;
  if (lastgamestatus == "win") {
    currentPlayer = "O";
  } else if (lastgamestatus == "loss") {
    currentPlayer = "X";
  } else {
    currentPlayer = Math.random() < 0.5 ? "X" : "O";
  }
  let setopp = currentPlayer === "X" ? "O" : "X";
  setInitHeaderAlpha(setopp);
  //document.querySelectorAll(".cell").forEach((cell) => {
  //  cell.textContent = "";
  //  cell.classList.remove("taken");
  //});
  if (currentPlayer === "O") {
    setTimeout(computerMove, 300);
  }
}

function removeAllMeshX0() {
  meshes.forEach((mesh) => {
    scene.remove(mesh);

    // Dispose geometry and material to free up memory
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });

  // Clear the meshes array
  meshes.length = 0;
}

function removeAllMeshText(arr) {
  arr.forEach((mesh) => {
    scene.remove(mesh);

    // Dispose geometry and material to free up memory
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });

  // Clear the arr array
  arr.length = 0;
}
