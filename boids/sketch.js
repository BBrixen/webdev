let vertices = [];
const num_vertices = 100;
const view_radius = 150;
const max_acceleration = 0.8;
const max_velocity = 6;
const wall_hatred = 50;
const boid_size = 3;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);

    for (let i = 0; i < num_vertices; i++) {
        vertices.push(new boid());
    }
}

function draw() {
    background(20);
        for (const v of vertices) {
    v.update(vertices);
    }
    for (const v of vertices) {
        v.show();
    }
}

class boid {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.limit(max_velocity);
        this.acceleration = createVector();
    }

    show() {
        let direction = createVector(this.velocity.x, this.velocity.y);
        let left = createVector(this.velocity.x, this.velocity.y);
        let right = createVector(this.velocity.x, this.velocity.y);
        direction.setMag(boid_size);
        left.setMag(boid_size);
        right.setMag(boid_size);
        left.rotate(3/4 * PI);
        right.rotate(-3/4 * PI);

        fill(220);
        stroke(220);
        line(this.position.x, this.position.y, 
            this.position.x + left.x * boid_size, this.position.y + left.y * boid_size);
        line(this.position.x, this.position.y, 
            this.position.x + right.x * boid_size, this.position.y + right.y * boid_size);
        line(this.position.x + direction.x * boid_size, this.position.y + direction.y * boid_size,
            this.position.x + left.x * boid_size, this.position.y + left.y * boid_size);
        line(this.position.x + direction.x * boid_size, this.position.y + direction.y * boid_size,
            this.position.x + right.x * boid_size, this.position.y + right.y * boid_size);
    }

    update(vertices) {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.acceleration = this.flock(vertices);
        // TODO: make them prioritize moving away from a close wall instead of flocking

        this.acceleration.setMag(max_acceleration);
        this.velocity.setMag(max_velocity);
        this.constrain();
    }

    repel_wall(wall_vec) {
        let d = dist(this.position.x, this.position.y, wall_vec.x, wall_vec.y);
        let repel = createVector();
        if (d < view_radius && d > 0) 
            repel = p5.Vector.sub(this.position, wall_vec);
        
        return repel;
    }

    flock(vertices) {
        let average_position = createVector(); // cohesion
        let align_velocities = createVector(); // alignment
        let repel_velocities = createVector(); // separation
        let repel_walls = createVector(); // steer away from walls
        let repel = createVector();
        let d = 0;
        let count = 0;

        // accumulate data
        for (const v of vertices) {
            d = dist(this.position.x, this.position.y, v.position.x, v.position.y);

            if (d < view_radius && d > 0) {
                count += 1;
                average_position.add(v.position);
                align_velocities.add(v.velocity);

                repel = p5.Vector.sub(this.position, v.position); // difference in position
                repel.div(d*d);
                repel_velocities.add(repel);
            }
        }

        repel_walls.add(this.repel_wall(createVector(this.position.x, 0)));
        repel_walls.add(this.repel_wall(createVector(this.position.x, height)));
        repel_walls.add(this.repel_wall(createVector(0, this.position.y)));
        repel_walls.add(this.repel_wall(createVector(width, this.position.y)));

        if (count == 0)
            return repel_walls;

        // average data
        average_position.div(count);
        align_velocities.div(count);
        repel_velocities.div(count);

        // calculate steering forces
        let diff = p5.Vector.sub(average_position, this.position);
        diff.setMag(max_velocity);
        diff.sub(this.velocity);

        align_velocities.setMag(max_velocity);
        align_velocities.sub(this.velocity);

        repel_velocities.setMag(max_velocity);
        repel_velocities.sub(this.velocity);

        repel_walls.setMag(wall_hatred * max_velocity);
        repel_walls.sub(this.velocity);

        // accumulate steering forces
        diff.add(align_velocities);
        diff.add(repel_velocities);
        diff.add(repel_walls);
        return diff;
    }

    constrain() {
        if (this.position.x >= width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = width;
        if (this.position.y >= height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = height;
    }
}