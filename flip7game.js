import {actionsDict, flip7deck} from "./flip7deck.js"
import {flip7player} from "./flip7player.js"
import { newGame } from "./main.js";

const messageDict = {
    "Second Chance": '<span style="color: pink; font-size: 50px; text-shadow: 1.5px 1.5px red;">SECOND CHANCE</span>',
    "Freeze": '<span style="color: dodgerblue; font-size: 50px; text-shadow: 1.5px 1.5px aqua;">FREEZE</span>',
    "Frozen": '<span style="color: dodgerblue; font-size: 50px; text-shadow: 1.5px 1.5px aqua;">FROZEN</span>',
    "Flip Three": '<span style="color: darkorange; font-size: 50px; text-shadow: 1.5px 1.5px yellow;">FLIP 3</span>',
    "Flips Three": '<span style="color: darkorange; font-size: 50px; text-shadow: 1.5px 1.5px yellow;">FLIPS 3</span>',
    "Flip 7": '<span class="rainbow-text">FLIP7</span>'
};

export class flip7game{
    constructor(playerNames){
        this.players = [];
        this.playerNames = playerNames;
        this.turn = 0;
        playerNames.forEach(name => {
            const player = new flip7player(name);
            this.players.push(player);
        });
        this.deck = new flip7deck();
        this.deck.shuffle();
        this.flip7 = false;
        this.flipBtn = document.getElementById("flip");
        this.flipBtnCard = document.getElementById("flip-card");
        this.stayBtn = document.getElementById("stay");
        this.message = "";
        this.gameMessage = document.getElementById("game-message");
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Returns whether there is a tie in the highest score
    gameWon() {
        const totalScores = this.players.map(player => player.totalScore);
        const highScore = Math.max(...totalScores);
        return totalScores.filter(s => s == highScore).length > 1;
    }

    showGameMessage(isStart = false) {
        this.gameMessage.classList.remove("fade");
        let fadeDelay = 250;
        if (isStart) {
            this.gameMessage.classList.add("start-message");
            fadeDelay = 500;
        } else {
            this.gameMessage.classList.remove("start-message");
        }

        setTimeout(() => {
            this.gameMessage.innerHTML = this.message;
            this.gameMessage.classList.add("fade");
        }, fadeDelay);
    }

    cardDisplay(card) {
        this.flipBtnCard.className = "flip-back";
        if (typeof card === "string") {
            if (card.startsWith('+') || card.startsWith('x')){
                this.flipBtnCard.className = "flip-back modifier";
                this.flipBtnCard.innerHTML = card;
            } else if (card === "Second Chance" || card === "Freeze" || card === "Flip Three"){
                const { className, innerHTML } = actionsDict[card];
                this.flipBtnCard.className = `flip-back ${className}`;
                this.flipBtnCard.innerHTML  = innerHTML;
            }
        } else {
            this.flipBtnCard.innerHTML = card;
        }
    }

    cardMessage(card) {
        var cardMessage = "";
        if (typeof card === "string") {
            if (card.startsWith('+') || card.startsWith('x')){
                cardMessage = `<span style="color: red; font-size: 50px;">${card}</span>`;
            } else if (card === "Second Chance" || card === "Freeze" || card === "Flip Three"){
                cardMessage = messageDict[card];
            }
        } else {
            cardMessage = `<span style="font-size: 50px;">${card}</span>`;
        }
        return cardMessage;
    }

    async flip(player, flip3 = false, flip3Queue = []){
        if (this.deck.deck.length == 0) {
            this.deck.shuffle();
        }
        const card = this.deck.deal();
        console.log(card);
        this.flipBtn.classList.toggle("flipped");
        this.cardDisplay(card);
        await this.delay(500);
        this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${player.name}</span>`
            + ' flipped ' + this.cardMessage(card) + '!';
        this.showGameMessage();
        this.flipBtn.classList.toggle("flipped");
        if (typeof card === "string") {
            if (card.startsWith('+') || card.startsWith('x')){
                player.drawModifier(card);
            } else if (card === "Second Chance"){
                if (player.actions.includes(card)){
                    await this.playAction(player,card);
                } else {
                    player.drawAction(card);
                }
            } else if (card === "Freeze" || card === "Flip Three") {
                player.drawAction(card);
                if (flip3){
                    flip3Queue.push({player,card});
                } else {
                    await this.playAction(player,card);
                }
            }
        } else {
            if (player.numbers.includes(card)){
                this.deck.discardCard(card);
                if (player.actions.includes("Second Chance")){
                    player.grid.classList.add('second-chance-grid');
                    await this.delay(250);
                    player.grid.classList.remove('second-chance-grid');
                    this.deck.discardCard("Second Chance");
                    player.discardAction("Second Chance");
                    await this.delay(750);
                    this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${player.name}</span>`
                        + ' flipped a duplicate but used '
                        + messageDict["Second Chance"] + '!';
                    this.showGameMessage();
                    await this.delay(500);
                } else {
                    player.grid.classList.remove("flip3-grid");
                    player.grid.classList.add('bust-grid');
                    await this.delay(250);
                    player.grid.classList.remove('bust-grid');
                    this.deck.discardCards(player.discardHand());
                    player.bust();
                    await this.delay(750);
                    this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${player.name}</span>`
                        + ' flipped a duplicate and BUSTED!';
                    this.showGameMessage();
                    await this.delay(1000);
                }
            } else {
                player.drawNumber(card);
                if (player.numbers.length === 7){
                    await this.delay(1000);
                    this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${player.name}</span>`
                        + ' got a ' + messageDict["Flip 7"] + '! (+15 bonus points!)</span>';
                    this.showGameMessage();
                    this.flip7 = true;
                    await this.delay(1000);
                    this.deck.discardCards(player.discardHand());
                    player.stay();
                    await this.delay(500);
                }
            }
        }
    }

    async playAction(player, card){
        if (card === "Second Chance"){
            if (this.players.filter(p => p.status).every(p => p.actions.includes("Second Chance"))){
                this.deck.discardCard(card);
            } else {
                const selectedPlayer = await this.selectPlayer(player, card);
                const secondChancePlayer = this.players.find(p => p.name === selectedPlayer);
                secondChancePlayer.drawAction(card);
                this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${selectedPlayer}</span>`
                    + ' is given ' + messageDict["Second Chance"] + '!';
                this.showGameMessage();
                await this.delay(1000);
            }
        }else if (card === "Freeze"){
            const selectedPlayer = await this.selectPlayer(player, card);
            this.deck.discardCard(card);
            player.discardAction(card);
            const frozenPlayer = this.players.find(p => p.name === selectedPlayer);
            this.deck.discardCards(frozenPlayer.discardHand());
            frozenPlayer.freeze();
            this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${selectedPlayer}</span>`
                + ' is ' + messageDict["Frozen"] + '!';
            this.showGameMessage();
            await this.delay(1000);
        }else if (card === "Flip Three"){
            const selectedPlayer = await this.selectPlayer(player, card);
            this.deck.discardCard(card);
            player.discardAction(card);
            const flip3Player = this.players.find(p => p.name === selectedPlayer);
            this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${flip3Player.name}</span> `
                + messageDict["Flips Three"] + '!';
            this.showGameMessage();
            flip3Player.grid.classList.add("flip3-grid");

            // Adds action cards drawn during a Flip 3 to a queue so they can be resolved in the order they are drawn after the Flip 3 finishes
            const flip3Queue = [];
            for (let i = 0; i < 3; i ++){
                if (flip3Player.status){
                    await this.delay(1000);
                    await this.flip(flip3Player, true, flip3Queue);
                    if (this.flip7) break;
                }
            }
            flip3Player.grid.classList.remove("flip3-grid");
            for(const action of flip3Queue){
                if (action.player.status){
                    await this.playAction(action.player, action.card);
                }
            }
        }
    }

    // Creates a popup and button options for each active and eligible player to select for action card actions
    selectPlayer(player, action){
        return new Promise(resolve => {
            const overlay = document.getElementById("popup-overlay");
            const popup = document.getElementById("popup");

            if (action === "Second Chance"){
                popup.innerHTML = `<span style ="color: yellow; font-size: 30px; text-shadow: 1px 1px red;">${player.name}</span><br><span style="color: white; font-size: 30px;">Select a player to give ${action} to</span><br>`;
                this.players.forEach(p => {
                if (p.status && !p.actions.includes("Second Chance")){
                    const playerBtn = document.createElement("button");
                    playerBtn.classList.add("popup-button");
                    playerBtn.textContent = p.name;
                    playerBtn.onclick = () => {
                        overlay.classList.remove("active");
                        resolve(p.name);
                    };
                    popup.appendChild(playerBtn);
                    }
                });
                overlay.classList.add("active");
            } else {
                popup.innerHTML = `<span style ="color: yellow; font-size: 30px; text-shadow: 1px 1px red;">${player.name}</span><br><span style="color: white; font-size: 30px;">Select a player to ${action}</span><br>`;
                this.players.forEach(p => {
                    if (p.status){
                        const playerBtn = document.createElement("button");
                        playerBtn.classList.add("popup-button");
                        playerBtn.textContent = p.name;
                        playerBtn.onclick = () => {
                            overlay.classList.remove("active");
                            resolve(p.name);
                        };
                        popup.appendChild(playerBtn);
                    }
                });
                overlay.classList.add("active");
            }
        });
    }

    async startRound(){
        const waitForFlip = (currentPlayer) => {
            return new Promise((resolve) => {
                this.flipBtn.onclick = async () => {
                    this.flipBtn.disabled = true;
                    this.stayBtn.disabled = true;
                    document.removeEventListener('keydown', waitForKey);
                    await this.flip(currentPlayer);
                    resolve();
                };
            });
        };

        const waitForStay = (currentPlayer) => {
            return new Promise((resolve) => {
                this.stayBtn.onclick = async () => {
                    this.stayBtn.disabled = true;
                    this.flipBtn.disabled = true;
                    document.removeEventListener('keydown', waitForKey);
                    this.stayBtn.classList.toggle("stayed");
                    await this.delay(250);
                    this.stayBtn.classList.toggle("stayed");
                    this.deck.discardCards(currentPlayer.discardHand());
                    currentPlayer.stay();
                    this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${currentPlayer.name}</span>`
                        + ' stayed!';
                    this.showGameMessage();
                    await this.delay(500);
                    resolve();
                };
            });
        };

        // Listens and activates buttons through right or left arrow keys
        const waitForKey = (e) => {
            if (e.keyCode === 37) {
                this.flipBtn.click();
            } else if (e.keyCode === 39) {
                this.stayBtn.click();  
            }
        };
        
        while (this.players.some(player => player.status === true)) {
            for(let i = 0; i < this.players.length; i++) {
                const currentPlayer = this.players[i];
                if (!currentPlayer.status) continue;
                if (this.flip7 === true) {
                    this.deck.discardCards(currentPlayer.discardHand());
                    currentPlayer.stay(); 
                    continue;
                }

                currentPlayer.grid.classList.add("current-grid");

                this.flipBtn.disabled = false;
                if ([...currentPlayer.numbers,...currentPlayer.modifiers,...currentPlayer.actions].length === 0) {
                    this.stayBtn.disabled = true;
                } else {
                    this.stayBtn.disabled = false;
                }
                document.addEventListener('keydown', waitForKey);
                
                await Promise.race([
                    waitForFlip(currentPlayer),
                    waitForStay(currentPlayer)
                ]);

                currentPlayer.sumRoundScore();
                currentPlayer.grid.classList.remove("current-grid");
            }
        }
    }

    async startGame(){
        document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    this.players.forEach(player => {
                        player.scoreDisplay.classList.add("show");
                        player.grid.querySelector(".player-display").classList.add("hide");
                    });
                }
            });

        document.addEventListener('keyup', (e) => {
                if (e.key === 'Tab') {
                    this.players.forEach(player => {
                        player.scoreDisplay.classList.remove("show");
                        player.grid.querySelector(".player-display").classList.remove("hide");   
                    });
                }
            });

        this.message = '<span style="color: white; font-size: 50px;">GAME START!</span>';
        this.showGameMessage(true);
        await this.delay(1000);
        while (this.players.every(player => player.totalScore < 200) || this.gameWon()){
            await this.delay(1000);
            this.message = '<span style="color: white; font-size: 50px;">NEW ROUND</span>';
            this.showGameMessage();
            this.players.forEach(player => {
                player.grid.classList.remove("out-grid", "frozen-grid");
            });
            this.flipBtn.disabled = false;
            this.stayBtn.disabled = false;
            await this.startRound();
            this.flipBtn.disabled = true;
            this.stayBtn.disabled = true;
            await this.delay(1000);
            this.message = '<span style="color: white; font-size: 50px;">ROUND END</span>';
            this.showGameMessage();
            this.flip7 = false;
            this.players.forEach(player => {
                player.reset();
            });
            await this.delay(500);
            console.log(`Deck:${this.deck.deck.length} Discarded:${this.deck.discarded.length}`);
        }
        const winner = this.players.reduce((highestPlayer, player) => 
            player.totalScore > highestPlayer.totalScore ? player : highestPlayer
        );
        const overlay = document.getElementById("popup-overlay");
        const popup = document.getElementById("popup");
        const newGameBtn = document.createElement("button");
        newGameBtn.classList.add("popup-button");
        newGameBtn.textContent = "New Game";
        newGameBtn.style.fontSize = "50px";
        newGameBtn.style.padding = "0px 25px";
        newGameBtn.onclick = () => {
            overlay.classList.remove("active");
            newGame();
                setTimeout(() => {
                    document.getElementById("player-screen").classList.add("screen-fadein");
                }, 500);
        };
        popup.innerHTML = `<span style="color: yellow; font-size: 60px; text-shadow: 2px 2px red;">${winner.name}</span>`
            + `<span style="color: white; font-size: 50px;"> won with ${winner.totalScore} points!</span><br><br>`;
        popup.appendChild(newGameBtn);
        overlay.classList.add('active');
    }
}