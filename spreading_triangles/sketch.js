let vertices = [];
let triangles = [];
let RX_slider, RY_slider, GX_slider, GY_slider, BX_slider, BY_slider, AX_slider, AY_slider;
const num_vertices = 120;
const view_radius = 80;
const max_acceleration = 0.8;
const max_velocity = 1;
const wall_hatred = 2;

function setup() {
    createCanvas(windowWidth, windowHeight);
    RX_slider = createSlider(-1, 1, -1, 0);
    RX_slider.position(20, 20);
    RY_slider = createSlider(-1, 1, -1, 0);
    RY_slider.position(20, 40);

    frameRate(30);
    for (let i = 0; i < num_vertices; i++) {
        vertices.push(new boid());
    }
}

function draw() {
    background(220);
    let points = [[0, 0], [0, height], [width, 0], [width, height]];

    for (const v of vertices) {
        points.push([v.position.x, v.position.y])
        v.update(vertices);
        v.show();
    }

    triangles = Delaunay.triangulate(points);
    strokeWeight(1);
    for (let i = 0; i < triangles.length; i += 3) {
        beginShape();
        
        let x_sum = points[triangles[i]][0] + points[triangles[i+1]][0] + points[triangles[i+2]][0];
        let y_sum = points[triangles[i]][1] + points[triangles[i+1]][1] + points[triangles[i+2]][1];
        let r = determine_color(x_sum, y_sum, RX_slider, RY_slider);
        // choose the color
        fill(r, 0, 0, 200);

        // draw vertices
        vertex(points[triangles[i]][0], points[triangles[i]][1]);
        vertex(points[triangles[i+1]][0], points[triangles[i+1]][1]);
        vertex(points[triangles[i+2]][0], points[triangles[i+2]][1]);
        endShape(CLOSE);
    }

    text("red X", RX_slider.x * 2 + RX_slider.width, RX_slider.y + 10);
    text("red Y", RY_slider.x * 2 + RY_slider.width, RY_slider.y + 15);
}

function determine_color(x_sum, y_sum, x_slider, y_slider) {
    let sum_weights = abs(x_slider.value()) + abs(y_slider.value());
    let x_factor = x_slider.value() / sum_weights;
    let y_factor = y_slider.value() / sum_weights;
    return 255 * (x_factor * x_sum / (3*width) + y_factor * y_sum / (3*height));
}

class boid {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(1);
        this.acceleration = createVector();
    }

    show() {
        stroke(0);
        strokeWeight(5);
        point(this.position.x, this.position.y);
    }

    update(vertices) {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.acceleration = this.push(vertices);

        this.acceleration.limit(max_acceleration);
        this.velocity.limit(max_velocity);
        this.constrain();
    }

    push(vertices) {
        let repel_velocities = createVector(); // separation
        let count = 0;

        // accumulate data
        for (const v of vertices) {
            let d = dist(this.position.x, this.position.y, v.position.x, v.position.y);
            
            if (d < view_radius && d > 0) {
            count += 1;
            
            let repel = p5.Vector.sub(this.position, v.position); // difference in position
            repel.div(d*d); // scale by distance MIGHT WANT TO CHANGE THIS TO JUST D, NOT D*D
            repel_velocities.add(repel);
            }
        }

        if (count == 0)
            return repel_velocities;

        // average data and return
        repel_velocities.div(count);
        repel_velocities.setMag(max_velocity);
        repel_velocities.sub(this.velocity);
        return repel_velocities;
    }

    constrain() {
        if (this.position.x >= width) this.position.x = width;
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.y >= height) this.position.y = height;
        if (this.position.y < 0) this.position.y = 0;
    }
}