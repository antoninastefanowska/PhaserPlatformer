var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
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
var debugText;
var scoreText;
var score=0;
var item;
var enemy_1;
var map;
var layer;

function preload() {
    this.load.image('background', 'assets/background-1.png');
    this.load.image('invisible-wall', 'assets/enemyWall.png');
    this.load.image('key', 'assets/23.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('tiles', 'assets/tileset-1.png', {frameWidth: 16, frameHeight: 16});

    this.load.tilemapTiledJSON('map', 'assets/map.json');
    this.load.spritesheet('player', 'assets/girl-2.png', { frameWidth: 99, frameHeight: 74});
    this.load.spritesheet('enemy_1', "assets/insect-1.png", { frameWidth: 78, frameHeight: 69 });
    this.load.spritesheet ('block', 'assets/fragile-block.png', {frameWidth: 40, frameHeight: 44});
}

function create() {
    var background = this.add.image(400, 300, 'background');
    background.fixedToCamera = true;
    
    this.cameras.main.setBounds(0, 0, 1600, 600);
    //this.world.setBounds(0, 0, 1600, 600);

    debugText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });
    //debugTex.setText("tu jestem");

    map = this.add.tilemap('map');
    var tileset = map.addTilesetImage('kafelki', 'tiles');
    layer = map.createDynamicLayer('floor', tileset, 0, 0);
    layer.setCollisionByExclusion([0], true);
    //map.setCollisionBetween(1337, 1338, true, layer, true);
    this.physics.world.bounds.width = layer.width;
    this.physics.world.bounds.height = layer.height;
    //this.physics.enable(layer);
    //layer.setCollisionBetween(1300, 1400, true);
    //layer.resizeWorld(); */

    player = this.physics.add.sprite(100, 450, 'player');
    //this.camera.follow(player);
    player.setOffset(0, 0);
    player.setCollideWorldBounds(true); 
    player.setActive(true);
    this.cameras.main.startFollow(player);

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

    enemy_1 = this.physics.add.sprite(405, 450, 'enemy_1');
    
    enemy_1.setCollideWorldBounds(true);
    enemy_1.setActive(true);
    
    this.anims.create({
        key: 'enemy_run',
        frames: this.anims.generateFrameNumbers('enemy_1', {start: 0, end: 4}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'enemy_die',
        frames: this.anims.generateFrameNumbers('enemy_1', {start: 5, end: 9}),
        frameRate: 10,
        repeat: 0
    });

    wall = this.physics.add.staticGroup();

    leftwall = wall.create(400, 538, 'invisible-wall');
    rightwall = wall.create(600, 538, 'invisible-wall');
    enemy_1.setVelocity(50);
    this.physics.add.overlap(enemy_1, leftwall, changeMoveLeft, null, this);
    this.physics.add.overlap(enemy_1, rightwall, changeMoveRight, null, this);
    
    this.physics.add.collider(enemy_1, player, die, null, this);
    enemy_1.play('enemy_run');
    leftwall.visible = false;
    rightwall.visible = false;    
    

    keys = this.physics.add.group({
        key: 'key',
        repeat: 0,
        setXY: { x: Phaser.Math.Between(300, 790), y: 150, stepX: 70 }
    });
    
    /* trzeba dodać platformy */
    //this.physics.add.collider(keys, platforms);

    //scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //this.physics.add.collider(player, platforms);
    //this.physics.add.collider(enemy_1, platforms);
    //this.physics.add.overlap(player, keys, collect, null, this);
}

function update() {
    if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.scaleX = 1;
        player.setOffset(0, 0);
    }
    else if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.scaleX = -1;
        player.setOffset(99, 0);
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
        else {
            player.anims.play('fall', true);
        }
    }
}

function changeMoveRight()
{
    enemy_1.setVelocityX(-50);
    enemy_1.scaleX = -1;
    enemy_1.anims.play('enemy_run', true);
}

function changeMoveLeft()
{
    enemy_1.setVelocityX(50);
    enemy_1.scaleX = 1;
    enemy_1.anims.play('enemy_run', true);
}

function die()
{
   if(enemy_1.body.touching.up && player.body.touching.down){
 
        enemy_1.play('enemy_die');
    
        enemy_1.setVelocity(0);
        enemy_1.disableBody(true,true);
    }
    else
    {
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver = true;
    }
}

function collect(player, key)
{
    key.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (keys.countActive(true) === 0)
    {
        keys.children.iterate(function (child) {

            child.enableBody(true, Phaser.Math.Between(300, 790), 150, true, true);

        });
    }
    
}
