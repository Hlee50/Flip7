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

// Adds a number to distinguish duplicate names
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
        prompt.innerHTML = `<strong>Enter Player ${i + 1}'s Name</strong>`;
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

    // Creates grid display for each player 
    for (let i = 0; i < playerNum; i ++){
        const playerGrid = document.createElement("div");
        playerGrid.className = "player-grid";
        playerGrid.id = `${playerNames[i].replace(/\s+/g, '-').toLowerCase()}`;

        const playerDisplay = document.createElement("div");
        playerDisplay.className = "player-display";
        playerDisplay.innerHTML = `<strong>${playerNames[i]}</strong>`;

        const playerHand = document.createElement("div");
        playerHand.className = "player-hand";

        const playerNumbers = document.createElement("div");
        playerNumbers.className = "player-numbers";
        playerNumbers.id = `${playerNames[i].replace(/\s+/g, '-').toLowerCase()}-numbers`;

        const nbsp = document.createElement("div");
        nbsp.innerHTML = "&nbsp;";

        const playerModifiers = document.createElement("div");
        playerModifiers.className = "player-modifiers";
        playerModifiers.id = `${playerNames[i].replace(/\s+/g, '-').toLowerCase()}-modifiers`;

        const playerActions = document.createElement("div");
        playerActions.className = "player-actions";
        playerActions.id = `${playerNames[i].replace(/\s+/g, '-').toLowerCase()}-actions`;

        playerHand.append(playerNumbers);
        playerHand.append(nbsp);
        playerHand.append(playerModifiers);
        playerHand.append(playerActions);
        playerDisplay.append(playerHand);
        playerGrid.append(playerDisplay);
        gridContainer.appendChild(playerGrid);

        playerGrid.classList.add("start");
        setTimeout(() => {
            playerGrid.classList.remove("start");
            playerGrid.classList.add("fade");
        }, i*200);
    }
}

async function main() {
    await enterNames();
    const game = new flip7game(playerNames);
    game.startGame();
}

// Resets game board HTML and player names array
export function newGame() {
    playerNames.length = 0;
    gridContainer.innerHTML = "";
    gameBoard.style.display = "none";
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

console.log("Developed by Hayden Lee");

startBtn.onclick = () => {
    startScreen.classList.add("screen-fadeout");
    setTimeout(() => {
        playerScreen.classList.add("screen-fadein");
    }, 500);
};

let playerNum;

for (let i = 0; i < 7; i ++){
    const playerNumBtn = document.createElement("button");
    playerNumBtn.classList.add("player-number");
    playerNumBtn.textContent = i + 2;
    playerNumBtn.onclick = async () => {
        playerNum = i + 2;
        playerScreen.classList.remove("screen-fadein");
        setTimeout(() => {
            namesScreen.classList.add("screen-fadein");
        }, 500);
        await main();
    };
    playerBtnRow.appendChild(playerNumBtn);
}