import {flip7game} from "./flip7game.js";

async function waitForEnter() {
    return new Promise(resolve => {
        function handler(event) {
            event.preventDefault();
            form.removeEventListener('submit', handler);
            resolve();
        }
        form.addEventListener('submit', handler);
    });
}

function uniqueName(name) {
    let unique = name;
    let count = 1;
    while (playerNames.includes(unique)) {
        unique = name + count;
        count++;
    }
    return unique;
}

async function enterNames(){
    for (let i = 0; i < playerNum; i ++){
        prompt.innerHTML = `Enter Player ${i + 1}'s Name`;
        await waitForEnter();
        let playerName = uniqueName(input.value);
        if (playerName.length === 0) {
            playerName = `Player ${i+1}`;
        }
        input.value = "";
        console.log(playerName);
        playerNames.push(playerName);
    }
    namesScreen.classList.remove("screen-fadein");
    gameBoard.style.display = "flex";

    for (let i = 0; i < playerNum; i ++){
        const playerGrid = document.createElement("div");
        playerGrid.className = "player-grid";
        playerGrid.id = `${playerNames[i].replace(/\s+/g, '-').toLowerCase()}`;
        gridContainer.appendChild(playerGrid);

        playerGrid.classList.add("start");
        setTimeout(() => {
            playerGrid.classList.remove("start");
            playerGrid.classList.add("fade");
        }, 200*i);
    }
}

async function main() {
    await enterNames();
    const game = new flip7game(playerNames);
    game.startGame();
}

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start");

const playerScreen = document.getElementById("player-screen");
const playerBtnRow = document.getElementById("player-number-row");

const namesScreen = document.getElementById("names-screen");
const prompt = document.getElementById("player-prompt");
const form = document.getElementById("player-form");
const input= document.getElementById("name-input");
const playerNames = [];
const gridContainer = document.getElementById("grid-container");
const gameBoard = document.getElementById("game-board");

startBtn.onclick = () => {
    startScreen.classList.add("screen-fadeout");
    setTimeout(() => {
        playerScreen.classList.add("screen-fadein");
    }, 500);
};

let playerNum;

for (let i = 0; i < 6; i ++){
    const playerNumBtn = document.createElement("button");
    playerNumBtn.classList.add("player-number");
    playerNumBtn.textContent = i + 3;
    playerNumBtn.onclick = async () => {
        playerNum = i + 3;
        playerScreen.classList.remove("screen-fadein");
        setTimeout(() => {
            namesScreen.classList.add("screen-fadein");
        }, 500);
        await main();
    };
    playerBtnRow.appendChild(playerNumBtn);
}