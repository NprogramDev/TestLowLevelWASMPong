// The entry file of your WebAssembly module.
const BALL_COLOR = 0xffffff;
const BALL_SIZE = 10;
const BALL_SPEED = 2;
const LEFT_PADDLE_X = 25;
const RIGHT_PADDLE_X = 375;
const PADDLE_HIGHT = 40;
const PADDLE_WIDTH = 5;
const PADDLE_SPEED = 7;
const RIGHT_PLAYER_ID = 3;
const LEFT_PLAYER_ID = 2;
const SLEEP_STATE_ID = 1;
const WIN_TEXT_X = 0;
const WIN_TEXT_Y = 100;

let dot_x = true;
let dot_y = false;
let current_height = 0;
let current_width = 0;
let matrix: i32[][] = [];
let ball_x = 50;
let ball_y = 50;
let left_paddle_y = 50;
let right_paddle_y = 50;
let rightPaddleUp = false;
let leftPaddleUp = false;
let won = 0;

const FONT: u8[][] = [
    [
        // A
        0b00010000, 0b00101000, 0b01000100, 0b01111100, 0b10000010, 0b10000001,
    ],
    [
        // B
        0b11111000, 0b11000110, 0b11001110, 0b11111100, 0b11000100, 0b11111000,
    ],
    [
        // C
        0b00111110, 0b11111000, 0b11100000, 0b11100000, 0b11111000, 0b00111110,
    ],
    [
        // D
        0b11111000, 0b11001100, 0b11000110, 0b11000110, 0b11001100, 0b11111000,
    ],
    [
        // E
        0b11111100, 0b11000000, 0b11000000, 0b11111100, 0b11000000, 0b11111100,
    ],
    [
        // F
        0b11111100, 0b11000000, 0b11000000, 0b11110000, 0b11000000, 0b11000000,
    ],
    [
        // G
        0b11111100, 0b11000000, 0b11000000, 0b11011100, 0b11000100, 0b11111100,
    ],
    [
        // H
        0b11001100, 0b11001100, 0b11001100, 0b11111100, 0b11001100, 0b11001100,
    ],
    [
        // I
        0b00110000, 0b00110000, 0b00110000, 0b00110000, 0b00110000, 0b00110000,
    ],
    [
        // J
        0b11111000, 0b00011000, 0b00011000, 0b00011000, 0b11011000, 0b00111000,
    ],
    [
        // K
        0b11000100, 0b11001100, 0b11011000, 0b11110000, 0b11011000, 0b11001100,
    ],
    [
        // L
        0b11000000, 0b11000000, 0b11000000, 0b1100000, 0b11000000, 0b11111100,
    ],
    [
        // M
        0b11001100, 0b10110100, 0b10110100, 0b10000100, 0b10000100, 0b10000100,
    ],
    [
        // N
        0b11000100, 0b10100100, 0b10100100, 0b10100100, 0b10010100, 0b10011100,
    ],
    [
        // O
        0b01111000, 0b10000100, 0b10000100, 0b10000100, 0b10000100, 0b01111000,
    ],
    [
        // P
        0b11110000, 0b10001100, 0b11111000, 0b10000000, 0b10000000, 0b10000000,
    ],
    [
        // Q
        0b01111000, 0b10000100, 0b10000100, 0b10010100, 0b10001100, 0b01111011,
    ],
    [
        // R
        0b11110000, 0b10001100, 0b11111000, 0b10011000, 0b10000100, 0b10000010,
    ],
    [
        // S
        0b11111100, 0b11000000, 0b01111000, 0b00000100, 0b01111100, 0b00000000,
    ],
    [
        //T
        0b11111100, 0b00010000, 0b00010000, 0b00010000, 0b00010000, 0b00010000,
    ],
    [
        // U
        0b10000100, 0b10000100, 0b10000100, 0b10000100, 0b10000100, 0b11111000,
    ],
    [
        // V
        0b10001000, 0b10001000, 0b10001000, 0b01010000, 0b01010000, 0b00100000,
    ],
    [
        // W
        0b10000100, 0b10000100, 0b10000100, 0b10010100, 0b10110100, 0b11001100,
    ],
    [
        // X
        0b10001000, 0b10001000, 0b01010000, 0b01100000, 0b10010000, 0b10001000,
    ],
    [
        // Y
        0b10001000, 0b10001000, 0b01010000, 0b00100000, 0b00100000, 0b00100000,
    ],
    [
        // Z
        0b11111100, 0b00011000, 0b00100000, 0b01000000, 0b10000000, 0b01111000,
    ],
    [
        // I
        0b00110000, 0b00110000, 0b00110000, 0b00110000, 0b00000000, 0b00110000,
    ],
    [0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000],
    [0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
];
const CHAR_WIDTH = 6;
const CHAR_HEIGHT = 6;
const CHAR_SPACING = 1;
const CHAR_RANGE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ! _";
let current_font_size = 5;
let current_font_color = 0xffffff;
let current_font = FONT;
function getCharInFont(char: i32): u8[] {
    for (let i = 0; i < CHAR_RANGE.length; i++) {
        if (CHAR_RANGE.charCodeAt(i) === char) {
            return current_font[i];
        }
    }
    return current_font[CHAR_RANGE.length - 1];
}

function writeText(x: i32, y: i32, text: string): void {
    for (let i = 0; i < text.length; i++) {
        let char = text.charCodeAt(i);
        let font_char = getCharInFont(char);
        for (let yOff = 0; yOff < font_char.length; yOff++) {
            let xOff8: u8 = 0;
            for (let xOff = 0; xOff < 8; xOff++) {
                if (font_char[yOff] & (1 << (7 - xOff8))) {
                    drawRect(x + xOff * current_font_size, y + yOff * current_font_size, current_font_size, current_font_size, current_font_color);
                }
                xOff8++;
            }
        }
        x += current_font_size * 8;
    }
}

function init(width: i32, height: i32): void {
    dot_x = true;
    dot_y = false;
    matrix = [];
    current_height = height;
    current_width = width;
    for (let i = 0; i < height; i++) {
        let row: i32[] = [];
        for (let j = 0; j < width; j++) {
            row.push(0);
        }
        matrix.push(row);
    }
}
function drawRect(x: i32, y: i32, width: i32, height: i32, color: i32): void {
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (x + j >= current_width || y + i >= current_height) {
                continue;
            }
            if (x + j < 0 || y + i < 0) {
                continue;
            }
            matrix[y + i][x + j] = color;
        }
    }
}
function drawBall(): void {
    drawRect(ball_x, ball_y, BALL_SIZE, BALL_SIZE, BALL_COLOR);
}

function drawPaddles(): void {
    drawRect(LEFT_PADDLE_X, left_paddle_y, PADDLE_WIDTH, PADDLE_HIGHT, BALL_COLOR);
    drawRect(RIGHT_PADDLE_X, right_paddle_y, PADDLE_WIDTH, PADDLE_HIGHT, BALL_COLOR);
}

function moveBall(): void {
    if (dot_x) {
        ball_x += BALL_SPEED;
    } else {
        ball_x -= BALL_SPEED;
    }
    if (dot_y) {
        ball_y += BALL_SPEED;
    } else {
        ball_y -= BALL_SPEED;
    }

    if (ball_y <= 0) {
        dot_y = true;
    }
    if (ball_y >= current_height - BALL_SIZE) {
        dot_y = false;
    }
    if (ball_x <= 0) {
        dot_x = true;
        won = RIGHT_PLAYER_ID;
    }
    if (ball_x >= current_width - BALL_SIZE) {
        dot_x = false;
        won = LEFT_PLAYER_ID;
    }
}
function movePaddle(): void {
    if (rightPaddleUp) {
        right_paddle_y -= PADDLE_SPEED;
    } else {
        right_paddle_y += PADDLE_SPEED;
    }
    if (leftPaddleUp) {
        left_paddle_y -= PADDLE_SPEED;
    } else {
        left_paddle_y += PADDLE_SPEED;
    }
    if (right_paddle_y <= 0) {
        right_paddle_y = 0;
    }
    if (right_paddle_y >= current_height - PADDLE_HIGHT) {
        right_paddle_y = current_height - PADDLE_HIGHT;
    }
    if (left_paddle_y <= 0) {
        left_paddle_y = 0;
    }
    if (left_paddle_y >= current_height - PADDLE_HIGHT) {
        left_paddle_y = current_height - PADDLE_HIGHT;
    }
}

function collision(): void {
    if (ball_x <= LEFT_PADDLE_X + PADDLE_WIDTH && ball_y >= left_paddle_y && ball_y <= left_paddle_y + PADDLE_HIGHT) {
        dot_x = true;
    }
    if (ball_x + BALL_SIZE >= RIGHT_PADDLE_X && ball_y >= right_paddle_y && ball_y <= right_paddle_y + PADDLE_HIGHT) {
        dot_x = false;
    }
}

function hasWon(): void {
    if (won === 0) return;
    switch (won) {
        case RIGHT_PLAYER_ID:
            writeText(WIN_TEXT_X, WIN_TEXT_Y, "RIGHT WON!");
            break;
        case LEFT_PLAYER_ID:
            writeText(WIN_TEXT_X, WIN_TEXT_Y, "LEFT WON!");
            break;
    }
    current_font_size = 2;
    writeText(WIN_TEXT_X, WIN_TEXT_Y + 5 * 8, "PRESS W TO RESTART!");
    current_font_size = 5;
    won = 1;
}

function tick(): void {
    drawRect(0, 0, current_width, current_height, 0);
    moveBall();
    movePaddle();
    drawBall();
    drawPaddles();
    collision();
    hasWon();
}

export function tickOfPingPong(width: i32, height: i32): i32[][] {
    if (current_height !== height || current_width !== width) {
        init(width, height);
    }
    if (won === 1) {
        return matrix;
    }
    tick();
    return matrix;
}
function reset(): void {
    ball_x = current_width / 2;
    ball_y = current_height / 2;
    left_paddle_y = 50;
    right_paddle_y = 50;
    won = 0;
}
export function moveRightPaddleUp(): void {
    if (won === 1) {
        reset();
    }
    rightPaddleUp = true;
}
export function moveRightPaddleDown(): void {
    rightPaddleUp = false;
}
export function moveLeftPaddleUp(): void {
    if (won === 1) {
        reset();
    }
    leftPaddleUp = true;
}
export function moveLeftPaddleDown(): void {
    leftPaddleUp = false;
}
