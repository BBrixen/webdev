let ants = [];
let pixel_map = null;
let trails = new Set()

const num_ants = 160; 
const max_acceleration = 0.1;
const max_velocity = 2;
const view_radius = 80;

const decay_rate = 0.99;
const blur_size = 4;
let blur_index = 0;

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
    for (let row = blur_index; row < height; row += blur_size) {
        for (let col = blur_index; col < width; col += blur_size) {
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

    // increase blur index to keep moving things over
    blur_index = (blur_index + 1) % blur_size;
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
        this.acceleration = this.sample_pheremones(pixel_map);

        this.acceleration.setMag(max_acceleration);
        this.velocity.setMag(max_velocity);

        this.constrain();
    }

    sample_pheremones(pixel_map) {
        // TODO: need to change center of right and left
        // also need to choose the max of these, and then move in that direcition
        let right_vec = p5.Vector.rotate(this.velocity, PI/3).setMag(4*max_velocity);
        let left_vec = p5.Vector.rotate(this.velocity, -PI/3).setMag(4*max_velocity);
        let front_vec = p5.Vector.rotate(this.velocity, 0).setMag(4*max_velocity);


        let front = this.sample_pheremones_direction(pixel_map, front_vec);
        let right = this.sample_pheremones_direction(pixel_map, right_vec);
        let left = this.sample_pheremones_direction(pixel_map, left_vec);

        if (right > front && right > left) {
            return p5.Vector.sub(right_vec, this.velocity);
        } else if (left > front && left > right) {
            return p5.Vector.sub(left_vec, this.velocity);
        }
        return createVector();
    }

    sample_pheremones_direction(pixel_map, heading) {
        let center_x = Math.floor(this.position.x + heading.x);
        let center_y = Math.floor(this.position.y + heading.y);
        let starting_x = center_x - view_radius;
        if (starting_x < 0) starting_x = 0;
        let starting_y = center_y - view_radius;
        if (starting_y < 0) starting_y = 0;
        
        let average = 0;
        for (let r = starting_y; r < center_y + view_radius && r < height; r++) {
            for (let c = starting_x; c < center_x + view_radius && c < width; c++) {
                average += pixel_map[r][c];
            }
        }

        return average/(view_radius*view_radius)
    }

    show(pixel_map) {
        pixel_map[Math.floor(this.position.y)][Math.floor(this.position.x)] = 255*blur_size*blur_size;
    }

    constrain() {
        if (this.position.x >= width) {
            this.position.x = width;
            this.velocity.rotate(PI);
        }
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.rotate(PI);
        }
        if (this.position.y >= height) {
            this.position.y = height;
            this.velocity.rotate(PI);
        }
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.rotate(PI);
        }
    }

}