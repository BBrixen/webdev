let vertices = [];
let triangles = [];
let RX_slider, RY_slider, GX_slider, GY_slider, BX_slider, BY_slider, AX_slider, AY_slider;
const num_vertices = 120;
const view_radius = 80;
const max_acceleration = 0.05;
const max_velocity = 1;
const wall_hatred = 2;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    
    RX_slider = createSlider(-1, 1, 0, 0);
    RX_slider.position(20, 20);
    RX_slider.style("width", "200px");

    RY_slider = createSlider(-1, 1, 0, 0);
    RY_slider.position(20, 40);
    RY_slider.style("width", "200px");

    GX_slider = createSlider(-1, 1, 0, 0);
    GX_slider.position(20, 60);
    GX_slider.style("width", "200px");

    GY_slider = createSlider(-1, 1, 0, 0);
    GY_slider.position(20, 80);
    GY_slider.style("width", "200px");

    BX_slider = createSlider(-1, 1, 0, 0);
    BX_slider.position(20, 100);
    BX_slider.style("width", "200px");

    BY_slider = createSlider(-1, 1, 0, 0);
    BY_slider.position(20, 120);
    BY_slider.style("width", "200px");

    AX_slider = createSlider(-1, 1, 0, 0);
    AX_slider.position(20, 140);
    AX_slider.style("width", "200px");

    AY_slider = createSlider(-1, 1, 0, 0);
    AY_slider.position(20, 160);
    AY_slider.style("width", "200px");

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
        
        let x_avg = (points[triangles[i]][0] + points[triangles[i+1]][0] + points[triangles[i+2]][0]) / (3 * width);
        let y_avg = (points[triangles[i]][1] + points[triangles[i+1]][1] + points[triangles[i+2]][1]) / (3 * height);
        
        // choose the color
        let r = determine_color(x_avg, y_avg, RX_slider, RY_slider);
        let g = determine_color(x_avg, y_avg, GX_slider, GY_slider);
        let b = determine_color(x_avg, y_avg, BX_slider, BY_slider);
        let a = determine_color(x_avg, y_avg, AX_slider, AY_slider);

        a /= 255;
        if (a > 1) a = 1;
        a = 192 + 64 * a;
        fill(r, g, b, a);

        // draw vertices
        vertex(points[triangles[i]][0], points[triangles[i]][1]);
        vertex(points[triangles[i+1]][0], points[triangles[i+1]][1]);
        vertex(points[triangles[i+2]][0], points[triangles[i+2]][1]);
        endShape(CLOSE);
    }

    fill(255);
    text("red X", RX_slider.x * 2 + RX_slider.width, RX_slider.y + 15);
    text("red Y", RY_slider.x * 2 + RY_slider.width, RY_slider.y + 15);
    text("green X", GX_slider.x * 2 + GX_slider.width, GX_slider.y + 15);
    text("green Y", GY_slider.x * 2 + GY_slider.width, GY_slider.y + 15);
    text("blue X", BX_slider.x * 2 + BX_slider.width, BX_slider.y + 15);
    text("blue Y", BY_slider.x * 2 + BY_slider.width, BY_slider.y + 15);
    text("alpha X", AX_slider.x * 2 + AX_slider.width, AX_slider.y + 15);
    text("alpha Y", AY_slider.x * 2 + AY_slider.width, AY_slider.y + 15);
}

// Calculates the color of a given position depending on its location and the slider for that color
function determine_color(x_avg, y_avg, x_slider, y_slider) {
    // This ugly math allows us to calculate the scaling of color in x and y direction
    // -1 * Math.floor(Math.sign(slider.value()) * 0.5) returns 1 if slider.value is negative, or 0 otherwise
    // We want it to be 1 so we can do 1 - avg to apply the color gradient in the other direction
    // Now we either have 1 - avg or 0 - avg = -avg (which gives us the ratio of how much color to use based on position)
    // We then multiply this ratio by the value of the slider again, to see how strong the color should be overall
    // In the cases when slider.value is negative, we want to multiply by -1 to make sure we get a positive answer
    // In the cases when slider.value is positive, then -avg is negative and we still want to multiply by -1 to get a positive answer
    // Mow we have the ratio of the color strength for this given position. we now multiply by 255 to get the 0-255 range

    let x_factor = -1 * x_slider.value() * 
        ((-1 * Math.floor(Math.sign(x_slider.value()) * 0.5)) - x_avg);
    let y_factor = -1 * y_slider.value() * 
        ((-1 * Math.floor(Math.sign(y_slider.value()) * 0.5)) - y_avg);

    return 255 * (x_factor + y_factor);
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
            // repel.div(d*d); // scale by distance MIGHT WANT TO CHANGE THIS TO JUST D, NOT D*D
            repel_velocities.add(repel);
            }
        }

        if (count == 0)
            return repel_velocities;

        // average data and return
        repel_velocities.div(count);
        // repel_velocities.setMag(max_velocity);
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