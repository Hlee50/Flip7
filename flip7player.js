export class flip7player{
    constructor(name){
        this.name = name;
        this.hand = [];
        this.modifiers = [];
        this.actionCards= [];
        this.status = true;
        this.roundScore = 0;
        this.totalScore = 0;
        this.grid = document.getElementById(`${this.name.replace(/\s+/g, '-').toLowerCase()}`)
        this.handDisplay = document.createElement("span");
        this.handDisplay.classList.add("hand");
        this.scoreDisplay = document.createElement("span");
        this.scoreDisplay.classList.add("score");
        this.grid.appendChild(this.handDisplay);
        this.grid.appendChild(this.scoreDisplay);
        this.display();
    }

    reset(){
        this.status = true;
    }

    drawNumber(card){
        this.hand.push(card);
        this.display();
    }

    drawModifier(card){
        if (card.startsWith('+')){
            this.modifiers.push(card);
        } else if (card.startsWith('x')){
            this.modifiers.unshift(card);
        }
        this.display();
    }

    drawAction(card){
        this.actionCards.push(card);
        this.display();
    }

    discardAction(card){
        this.actionCards = this.actionCards.filter(c => c !== card);
        this.display();
    }

    discardHand(){
       const discardedHand = [...this.hand,...this.modifiers,...this.actionCards]; 
       return discardedHand;
    }

    bust(){
        this.hand = [];
        this.modifiers = [];
        this.actionCards= [];
        this.status = false;
        this.roundScore = 0;
        this.display();
        this.grid.classList.remove("current-grid");
        this.grid.classList.add("out-grid");
    }

    stay(){
        this.sumRoundScore();
        this.sumTotalScore();
        this.hand = [];
        this.modifiers = [];
        this.actionCards= [];
        this.status = false;
        this.roundScore = 0;
        this.display();
        this.grid.classList.remove("current-grid");
        this.grid.classList.add("out-grid");
    }

    freeze(){
        this.sumRoundScore();
        this.sumTotalScore();
        this.hand = [];
        this.modifiers = [];
        this.actionCards= [];
        this.status = false;
        this.roundScore = 0;
        this.display();
        this.grid.classList.remove("current-grid");
        this.grid.classList.add("frozen-grid");
    }

    sumRoundScore(){
        this.roundScore = this.hand.reduce((acc, curr) => acc + curr, 0);
        this.modifiers.forEach(mod => {
            if (mod.startsWith('+')){
                this.roundScore += parseInt(mod.slice(1), 10);
            }else{
                this.roundScore *= parseInt(mod.slice(1), 10);
            }
        });
        if (this.hand.length === 7){
            this.roundScore += 15;
        }
    }

    sumTotalScore(){
        this.totalScore += this.roundScore;
    }


    display(){
        this.handDisplay.innerHTML = '<b>' + this.name + '</b>'
            + '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: white">[' + this.hand + ']<br>'
            + "[" + this.modifiers + "] [" + this.actionCards + "]</span><br>"
        this.scoreDisplay.innerHTML = 'Round Score: ' + this.roundScore + ' Total Score: ' + this.totalScore;
        return new Promise(requestAnimationFrame);
    }
}