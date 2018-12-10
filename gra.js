var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var player;
var cursors;
var prevVelocityY;
var debugText;

function preload() {
    //this.stage.backgroundColor = '#48a';
    this.load.image('background', 'assets/background-1.png');
    this.load.spritesheet('player', 'assets/girl-2.png', { frameWidth: 99, frameHeight: 74});
}

function create() {
    this.add.image(400, 300, 'background');

    debugText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });
    
    player = this.physics.add.sprite(100, 450, 'player');
    player.setCollideWorldBounds(true);
    player.setActive(true);

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 4}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 10 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('player', { start: 11, end: 13}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'fall',
        frames: this.anims.generateFrameNumbers('player', { start: 14, end: 16}),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    prevVelocityY = 0;
}

function update() {
    if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.scaleX = 1;
    }
    else if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.scaleX = -1;
    }
    else {
        player.setVelocityX(0);
    }

    if (player.body.onFloor()) {
        if (cursors.right.isDown || cursors.left.isDown) {
            player.anims.play('run', true);
        }
        else {
            player.anims.play('idle', true);
        }

        if (cursors.up.isDown) {
            player.setVelocityY(-330);
        }
    }
    else {
        if (Math.round(player.body.velocity.y) < 0) {
            player.anims.play('jump', true);
        }
        else if (Math.round(player.body.velocity.y) > 0) {
            player.anims.play('fall', true);
        }
    }
    
    if (cursors.down.isDown)
        debugText.setText('prev: ' + Math.round(prevVelocityY) + ' curr: ' + Math.round(player.body.velocity.y));
}