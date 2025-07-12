export const actionsDict = {
    "Second Chance": { className: "second-chance", innerHTML: "&#x2764;" },
    "Freeze": { className: "freeze", innerHTML: "&#10052;" },
    "Flip Three": { className: "flip3", innerHTML: "F3" }
};

export class flip7deck {
    // Constructs a deck with 94 cards: 79 number cards, 6 modifier cards, and 9 action cards
    constructor(){
        this.deck = [...Array(3).fill("Second Chance"), ...Array(3).fill("Freeze"), ...Array(3).fill("Flip Three"), "+2", "+4", "+6", "+8", "+10", "x2", 0];
        for (let n = 12; n >= 1; n--) {
            this.deck.push(...Array(n).fill(n));
        }
        this.discarded = [];
    }

    shuffle(){
        this.deck = this.deck.concat(this.discarded);
        this.discarded = [];
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        console.log(this.deck.length);
    }

    deal(){
        return this.deck.shift();
    }

    discardCard(card){
        this.discarded.push(card);
    }

    discardCards(cards){
        this.discarded.push(...cards);
    }
}