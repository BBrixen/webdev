let ants = [];
const num_ants = 80;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);

    for (let i = 0; i < num_ants; i++) {
        ants.push(new ant());
    }
}

function draw() {
    background(20);
    for (const v of vertices) {
        v.update(vertices);
        v.show();
    }

    strokeWeight(1);
    fill(255);
}

class ant {
    constructor() {
        // TODO
    }

    update() {
        // TODO
    }

    show() {
        // TODO
    }
}