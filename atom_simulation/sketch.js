let vertices = [];
const num_vertices = 40;
const view_radius = 300;
const max_acceleration = 7;
const max_velocity = 16;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);

    for (let i = 0; i < num_vertices; i++) {
        vertices.push(new vertex());
    }
}

function draw() {
    background(20);
    for (const v of vertices) {
        v.update(vertices);
        v.show();
    }
}

class vertex {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.limit(max_velocity);
        this.acceleration = createVector();
    }

    show() {
        stroke(220);
        strokeWeight(5);
        point(this.position.x, this.position.y);
    }

    update(vertices) {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.acceleration = this.pull(vertices);

        this.acceleration.limit(max_acceleration);
        this.velocity.limit(max_velocity);
        this.constrain();
    }

    pull(vertices) {
        let accumulation = createVector();
        let count = 0;

        for (const v of vertices) {
            if (v == this) continue;
            let d = dist(this.position.x, this.position.y, v.position.x, v.position.y);
            if (d < view_radius) {
                accumulation.add(v.position);
                count += 1;
            }
        }

        if (count == 0) 
            return createVector(0, 0);

        accumulation.div(count);

        // now we have average location
        let diff = p5.Vector.sub(accumulation, this.position);
        diff.sub(this.velocity);
        return diff;
    }

    constrain() {
        if (this.position.x >= width)  this.position = createVector(0, this.position.y);
        if (this.position.x < 0)      this.position = createVector(width, this.position.y);
        if (this.position.y >= height) this.position = createVector(this.position.x, 0);
        if (this.position.y < 0)       this.position = createVector(this.position.x, height);
    }
}