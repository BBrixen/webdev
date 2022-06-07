let vertices = [];
let speed, ratio, view_radius; // these controll the max_velocity and also the ratio of acceleration/velocity
const num_vertices = 80;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);

    speed = createSlider(0.1, 20, 10, 0.1);
    speed.position(20, 20);
    speed.style("width", "200px");

    ratio = createSlider(0, 1, 0.5, 0.1);
    ratio.position(20, 40);
    ratio.style("width", "200px");

    view_radius = createSlider(0, 600, 300, 0.1);
    view_radius.position(20, 60);
    view_radius.style("width", "200px");

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

    strokeWeight(1);
    fill(255);
    text("max velocity", speed.x * 2 + speed.width, speed.y + 15);
    text("acceleration:velocity ratio", ratio.x * 2 + ratio.width, ratio.y + 15);
    text("view radius", view_radius.x * 2 + view_radius.width, view_radius.y + 15);
}

class vertex {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.limit(speed.value());
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

        this.acceleration.limit(speed.value() * ratio.value());
        this.velocity.limit(speed.value());
        this.constrain();
    }

    pull(vertices) {
        let accumulation = createVector();
        let count = 0;

        for (const v of vertices) {
            if (v == this) continue;
            let d = dist(this.position.x, this.position.y, v.position.x, v.position.y);
            if (d < view_radius.value()) {
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