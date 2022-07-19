let ants = [];
let pixel_map = null;
let trails = new Set()

const max_acceleration = 0.8;
const max_velocity = 4;
const num_ants = 80;
const decay_rate = 0.99; 
const view_radius = 20;
const blur_size = 16;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);

    background(0);
    loadPixels();
    pixel_map = new Array(height+1).fill(0).map(() => new Array(width+1).fill(0));

    for (let i = 0; i < num_ants; i++) {
        ants.push(new ant());
    }
}

function draw() {
    loadPixels();

    for (const a of ants) {
        a.update(pixel_map);
        a.show(pixel_map);
    }

    pixel_map = blur(pixel_map);
    
    // copying information to display pixels
    let index = 0;
    for (let row = 0; row < height; row ++) {
        for (let col = 0; col < width; col ++) {

            let val = Math.floor(pixel_map[row][col]) * decay_rate;
            pixel_map[row][col] = val;

            pixels[index] = val;
            pixels[index+1] = val;
            pixels[index+2] = val;
            index += 4;
        }
    }

    updatePixels();
}

function blur(pixel_map) {
    for (let row = 0; row < height; row += blur_size) {
        for (let col = 0; col < width; col += blur_size) {
            let average = 0;
            
            for (let r = 0; r < blur_size && row+r < height; r++) {
                for (let c = 0; c < blur_size && col+c < width; c++) {
                    average += pixel_map[row + r][col + c];
                }
            }
            average /= (blur_size * blur_size);

            for (let r = 0; r < blur_size && row+r < height; r++) {
                for (let c = 0; c < blur_size && col+c < width; c++) {
                    pixel_map[row + r][col + c] = average;
                }
            }
        }
    }
    return pixel_map;
}

function coord_to_index(x, y) {
    return (x + y*width) * 4;
}

// the ant class represents something that follows pheremones around, like ants do
class ant {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.limit(max_velocity);
        this.acceleration = createVector();
    }

    update(pixel_map) {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        // this.acceleration = this.sample_pheremones(trails);

        this.acceleration.setMag(max_acceleration);
        this.velocity.setMag(max_velocity);

        this.constrain();
    }

    sample_pheremones(pixel_map) {
        // TODO: need to change center of right and left
        // also need to choose the max of these, and then move in that direcition
        let front = this.sample_pheremones_direction(trails, this.position);
        let right = this.sample_pheremones_direction(trails, this.position);
        let left = this.sample_pheremones_direction(trails, this.position);
    }

    sample_pheremones_direction(trails, center) {
        let cumulative_pheramones
        
    }

    show(pixel_map) {
        pixel_map[Math.floor(this.position.y)][Math.floor(this.position.x)] = 255*blur_size;
    }

    constrain() {
        if (this.position.x >= width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = width;
        if (this.position.y >= height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = height;
    }

}