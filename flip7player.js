import { actionsDict } from "./flip7deck.js";

export class flip7player{
    constructor(name){
        this.name = name;
        this.numbers = [];
        this.modifiers = [];
        this.actions= [];
        this.status = true;
        this.roundScore = 0;
        this.totalScore = 0;
        this.grid = document.getElementById(`${this.name.replace(/\s+/g, '-').toLowerCase()}`);
        this.numbersDisplay = document.getElementById(`${this.name.replace(/\s+/g, '-').toLowerCase()}-numbers`);
        this.modifiersDisplay = document.getElementById(`${this.name.replace(/\s+/g, '-').toLowerCase()}-modifiers`);
        this.actionsDisplay = document.getElementById(`${this.name.replace(/\s+/g, '-').toLowerCase()}-actions`);
        this.scoreDisplay = document.createElement("span");
        this.scoreDisplay.classList.add("score");
        this.grid.appendChild(this.scoreDisplay);
        this.displayScore();
    }

    reset(){
        this.status = true;
        this.numbersDisplay.classList.toggle("fade");
        this.modifiersDisplay.classList.toggle("fade");
        this.actionsDisplay.classList.toggle("fade");
    }

    // Draws a card, adds it to the appriopriate array, and displays it
    drawNumber(card){
        this.numbers.push(card);
        const c = document.createElement("div");
        c.className = "card";
        c.innerHTML = card;

        this.numbersDisplay.appendChild(c);

        setTimeout(() => {
            c.classList.add("drawn");
        }, 250);
        this.sumRoundScore();
        this.displayScore();
    }

    drawModifier(card){
        if (card.startsWith('+')){
            this.modifiers.push(card);
        } else if (card.startsWith('x')){
            this.modifiers.unshift(card);
        }

        const c = document.createElement("div");
        c.className = "card modifier";
        c.innerHTML = card;
        
        this.modifiersDisplay.appendChild(c);

        setTimeout(() => {
            c.classList.add("drawn");
        }, 250);
        this.sumRoundScore();
        this.displayScore();
    }

    drawAction(card){
        this.actions.push(card);
        const c = document.createElement("div");
        const { className, innerHTML } = actionsDict[card];
        c.className = `card ${className}`;
        c.innerHTML = innerHTML;

        this.actionsDisplay.appendChild(c);

        setTimeout(() => {
            c.classList.add("drawn");
        }, 250);
    }

    discardAction(card){
        this.actions = this.actions.filter(c => c !== card);
        const cards = this.actionsDisplay.getElementsByClassName("card");
        for (let c of cards) {
            if (c.classList.contains(actionsDict[card].className)) {
                c.classList.remove("drawn");
                setTimeout(() => {
                    this.actionsDisplay.removeChild(c);
                }, 250);
                break;
            }
        }
    }

    discardHand(){
       const discardedHand = [...this.numbers,...this.modifiers,...this.actions];
       return discardedHand;
    }

    bust(){
        this.numbers = [];
        this.modifiers = [];
        this.actions = [];
        this.status = false;
        this.roundScore = 0;
        this.grid.classList.remove("current-grid");
        this.grid.classList.add("out-grid");
        this.displayHand();
        this.displayScore();
    }

    stay(){
        this.sumRoundScore();
        this.sumTotalScore();
        this.numbers = [];
        this.modifiers = [];
        this.actions = [];
        this.status = false;
        this.roundScore = 0;
        this.grid.classList.remove("current-grid");
        this.grid.classList.add("out-grid");
        this.displayHand();
        this.displayScore();
    }

    freeze(){
        this.sumRoundScore();
        this.sumTotalScore();
        this.numbers = [];
        this.modifiers = [];
        this.actions = [];
        this.status = false;
        this.roundScore = 0;
        this.grid.classList.remove("current-grid");
        this.grid.classList.add("frozen-grid");
        this.displayHand();
        this.displayScore();
    }

    sumRoundScore(){
        this.roundScore = this.numbers.reduce((acc, curr) => acc + curr, 0);
        this.modifiers.forEach(mod => {
            if (mod.startsWith('+')){
                this.roundScore += parseInt(mod.slice(1), 10);
            }else{
                this.roundScore *= parseInt(mod.slice(1), 10);
            }
        });
        if (this.numbers.length === 7){
            this.roundScore += 15;
        }
    }

    sumTotalScore(){
        this.totalScore += this.roundScore;
    }

    // Fades hand with the rest of the player grid
    displayHand(){
        this.numbersDisplay.classList.toggle("fade");
        this.modifiersDisplay.classList.toggle("fade");
        this.actionsDisplay.classList.toggle("fade");
        setTimeout(() => {
            this.numbersDisplay.innerHTML = "";
            this.modifiersDisplay.innerHTML = "";
            this.actionsDisplay.innerHTML = "";
        }, 500);
    }

    displayScore(){
        this.scoreDisplay.innerHTML = 'Round Score: ' + this.roundScore + ' Total Score: ' + this.totalScore;
    }
}