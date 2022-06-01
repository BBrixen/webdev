let vertices = [];
let triangles = [];
const num_vertices = 120;
const view_radius = 80;
const max_acceleration = 0.8;
const max_velocity = 1;
const wall_hatred = 2;

function setup() {
    createCanvas(windowWidth, windowHeight);
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

        fill(10, 80, (i / triangles.length)*255, 128+(i/triangles.length)*128);

        vertex(points[triangles[i]][0], points[triangles[i]][1]);
        vertex(points[triangles[i+1]][0], points[triangles[i+1]][1]);
        vertex(points[triangles[i+2]][0], points[triangles[i+2]][1]);
        endShape(CLOSE);
    }
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
        let repel = createVector();
        let d = 0;
        let count = 0;

        // accumulate data
        for (const v of vertices) {
            d = dist(this.position.x, this.position.y, v.position.x, v.position.y);
            
            if (d < view_radius && d > 0) {
            count += 1;
            
            repel = p5.Vector.sub(this.position, v.position); // difference in position
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