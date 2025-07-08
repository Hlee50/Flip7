import {flip7deck} from "./flip7deck.js"
import {flip7player} from "./flip7player.js"

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
        this.flipbtn = document.getElementById("flip");
        this.staybtn = document.getElementById("stay");
        this.message = "";
        this.gameMessage = document.getElementById("game-message");
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    async flip(player){
        if (this.deck.deck.length == 0) {
            this.deck.shuffle();
        }
        const card = this.deck.deal();
        console.log(card);
        this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${player.name}</span>`
            +`<span style="color: white; font-size: 40px;"> flipped ${card}!</span>`;
        this.showGameMessage();
        if (typeof card === "string") {
            if (card.startsWith('+')){
                player.modifiers.push(card);
            } else if (card.startsWith('x')){
                player.modifiers.unshift(card);
            } else if (card.startsWith("Second") || card.startsWith("Freeze") || card.startsWith("Flip")) {
                player.actionCards.push(card);
                await this.playAction(player, card);
            }
        } else {
            if (player.hand.includes(card)){
                this.deck.discardCard(card);
                if (player.actionCards.includes("Second Chance")){
                    player.grid.classList.add('second-chance-grid');
                    await this.delay(250);
                    player.grid.classList.remove('second-chance-grid');
                    await this.delay(750);
                    this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${player.name}</span>`
                        + '<span style="color: white; font-size: 40px;"> flipped a duplicate but used '
                        + '<span style="color: pink; font-size: 50px; text-shadow: 1.5px 1.5px red;">SECOND CHANCE</span>!</span>';
                    this.showGameMessage();
                    await this.delay(500);
                    this.deck.discardCard("Second Chance");
                    player.actionCards.splice(player.actionCards.indexOf("Second Chance"), 1);
                } else {
                    player.grid.classList.remove("flip3-grid");
                    player.grid.classList.add('bust-grid');
                    await this.delay(250);
                    player.grid.classList.remove('bust-grid');
                    await this.delay(750);
                    this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${player.name}</span>`
                        + `<span style="color: white; font-size: 40px;"> flipped a duplicate and BUSTED!</span>`;
                    this.showGameMessage();
                    await this.delay(1000);
                    this.deck.discardCards(player.discardHand());
                    player.bust();
                }
            } else {
                player.hand.push(card);
                if (player.hand.length === 7){
                    player.display();
                    await this.delay(1000);
                    this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${player.name}</span>`
                        + '<span style="color: white; font-size: 40px;"> got a' 
                        + '<span class="rainbow-text" style ="font-size: 50px;"> FLIP7</span>' 
                        + '! (+15 bonus points!)</span>';
                    this.showGameMessage();
                    this.flip7 = true;
                    await this.delay(1000);
                    this.deck.discardCards(player.discardHand());
                    player.stay();
                    await this.delay(500);
                }
            }
        }
        await player.display();
    }

    async playAction(player, card){
        if (card.includes("Freeze")){
            const selectedPlayer = await this.selectPlayerAsync("Freeze");
            this.deck.discardCard(card);
            player.actionCards = player.actionCards.filter(c => c !== "Freeze");
            player.display();
            const frozenPlayer = this.players.find(p => p.name === selectedPlayer);
            this.message = '<span style="color: white; font-size: 40px;">'
                + `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${selectedPlayer}</span><span style="color: white; font-size: 40px;">`
                + ' is <span style="color: dodgerblue; font-size: 50px; text-shadow: 1.5px 1.5px aqua;">FROZEN</span>!</span>';
            this.showGameMessage();
            await this.delay(1000);
            this.deck.discardCards(frozenPlayer.discardHand());
            frozenPlayer.freeze();
        }else if (card.includes("Flip")){
            const selectedPlayer = await this.selectPlayerAsync("Flip Three");
            this.deck.discardCard(card);
            player.actionCards = player.actionCards.filter(c => c !== "Flip Three");
            player.display();
            const flip3Player = this.players.find(p => p.name === selectedPlayer);
            this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${flip3Player.name}</span> `
                + '<span style="color: darkorange; font-size: 50px; text-shadow: 1.5px 1.5px yellow;"> FLIPS 3</span><span style="color: white; font-size: 40px;">!</span>';
            this.showGameMessage();
            flip3Player.grid.classList.add("flip3-grid");
            for (let i = 0; i < 3; i ++){
                if (flip3Player.status){
                    await this.delay(1000);
                    await this.flip(flip3Player);
                    if (this.flip7) break;
                }
            }
            flip3Player.grid.classList.remove("flip3-grid");
        }
    }

    selectPlayer(action, selected){
        const overlay = document.getElementById("popup-overlay");
        const popup = document.getElementById("popup");
        
        popup.innerHTML = `<span style='color: yellow; font-size: 30px;'>Select a player to ${action} </span><br>`;

        this.players.forEach(player => {
            if (player.status){
                const playerBtn = document.createElement("button");
                playerBtn.classList.add("popup-button");
                playerBtn.textContent = player.name;
                playerBtn.onclick = () => {
                    overlay.classList.remove("active");
                    selected(player.name);
                };
                popup.appendChild(playerBtn);
            }
        });
        overlay.classList.add("active");
    }

    selectPlayerAsync(action) {
        return new Promise(resolve => {
            this.selectPlayer(action, resolve);
        });
    }

    async startRound(){
        while (this.players.some(player => player.status === true)) {
            for(let i = 0; i < this.players.length; i++) {
                const currentPlayer = this.players[i];
                if (!currentPlayer.status) continue;
                if (this.flip7 === true) {
                    this.deck.discardCards(currentPlayer.discardHand());
                    currentPlayer.stay(); 
                    continue;
                }

                currentPlayer.grid.classList.toggle("current-grid");

                const waitForFlip = (currentPlayer) => {
                    return new Promise((resolve) => {
                        this.flipbtn.onclick = async () => {
                            if (!currentPlayer.status) return;
                            this.flipbtn.disabled = true;
                            this.staybtn.disabled = true;
                            await this.flip(currentPlayer);
                            resolve(currentPlayer.name + " flips");
                        };
                    });
                };

                const waitForStay = (currentPlayer) => {
                    return new Promise((resolve) => {
                        this.staybtn.onclick = async () => {
                            if (!currentPlayer.status) return;
                            this.staybtn.disabled = true;
                            this.flipbtn.disabled = true;
                            this.message = `<span style="color: yellow; font-size: 50px; text-shadow: 1.5px 1.5px red;">${currentPlayer.name}</span>`
                                + `<span style="color: white; font-size: 40px;"> stayed!</span>`;
                            this.showGameMessage();
                            await this.delay(500);
                            this.deck.discardCards(currentPlayer.discardHand());                      
                            await currentPlayer.stay();
                            resolve(currentPlayer.name + " stays");
                        };
                    });
                };

                this.flipbtn.disabled = false;
                this.staybtn.disabled = false;
                
                await Promise.race([
                    waitForFlip(currentPlayer),
                    waitForStay(currentPlayer)
                ]);

                currentPlayer.sumRoundScore();
                currentPlayer.display();
                currentPlayer.grid.classList.toggle("current-grid");
            }
        }
    }

    async startGame(){
        this.message = '<span style="color: white; font-size: 50px;">GAME START!</span>';
        this.showGameMessage(true);
        await this.delay(1000);
        while (this.players.every(player => player.totalScore < 200)){
            await this.delay(1000);
            this.message = '<span style="color: white; font-size: 50px;">NEW ROUND</span>';
            this.showGameMessage();
            this.players.forEach(player => {
                player.grid.classList.remove("out-grid", "frozen-grid");
            });
            this.flipbtn.disabled = false;
            this.staybtn.disabled = false;
            await this.startRound();
            this.flipbtn.disabled = true;
            this.staybtn.disabled = true;
            await this.delay(1000);
            this.message = '<span style="color: white; font-size: 50px;">ROUND END</span>';
            this.showGameMessage();
            this.flip7 = false;
            if (this.players.every(player => player.totalScore < 200)){
                this.players.forEach(player => {
                    player.reset();
                });
            }
            await this.delay(500);
            console.log(`Deck:${this.deck.deck.length} Discarded:${this.deck.discarded.length}`);
        }
        const winner = this.players.reduce((highestPlayer, player) => 
            player.totalScore > highestPlayer.totalScore ? player : highestPlayer
        );
        const overlay = document.getElementById("popup-overlay");
        const popup = document.getElementById("popup");
        popup.innerHTML = `<span style="color: yellow; font-size: 75px; text-shadow: 2px 2px red;">${winner.name}</span>`
            + `<span style="color: white; font-size: 50px;"> won with ${winner.totalScore} points!</span>`;
        overlay.classList.add('active');
    }
}