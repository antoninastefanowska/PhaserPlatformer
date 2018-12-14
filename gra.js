class GameScene extends Phaser.Scene
{
    constructor()
    {
        super({key: 'GameScene'});
    }

    preload() 
    {
        this.load.image('background', 'assets/background-1.png');
        this.load.image('invisible-wall', 'assets/enemyWall.png');
        this.load.image('key', 'assets/23.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('health-bar-background', 'assets/health-bar-backgound.png');
        this.load.image('health-bar-top', 'assets/health-bar-top-1.png');
        this.load.image('bar-start', 'assets/bar-start.png');
        this.load.image('bar-middle', 'assets/bar-middle.png');
        this.load.image('bar-end', 'assets/bar-end.png');

        this.load.spritesheet('tiles', 'assets/tileset-1.png', {frameWidth: 16, frameHeight: 16});
        this.load.tilemapTiledJSON('map', 'assets/map.json');

        this.load.spritesheet('player', 'assets/girl-2.png', {frameWidth: 99, frameHeight: 74});
        this.load.spritesheet('enemy_1', "assets/insect-1.png", {frameWidth: 78, frameHeight: 69});
        this.load.spritesheet ('block', 'assets/fragile-block.png', {frameWidth: 40, frameHeight: 44});
        this.load.spritesheet('treasure', 'assets/chest.png', {frameWidth: 60, frameHeight: 36});
        this.load.spritesheet('fire-empty', 'assets/fire.png', {frameWidth: 83, frameHeight: 32});
        this.load.spritesheet('fire-meat', 'assets/fire-meat.png', {frameWidth: 84, frameHeight: 55});

        this.load.bitmapFont('number-font', 'assets/font-number-40x40-export.png', 'assets/font-number-40x40-export.xml');

        this.load.audio('music', 'assets/theme-1.ogg');
        this.load.audio('hit', 'assets/hit-1.wav')
    }
    
    create() 
    {
        this.createWorld();
        this.createPlayer();
        this.createEnemy();
        this.createKeys();    
        this.createTreasures();
        this.createFireplaces();
        //this.createPlatforms();
        this.createHUD();        
    }

    createWorld()
    {
        this.background = this.add.tileSprite(800, 300, 1600, 600, 'background');
        this.background.setScrollFactor(0.1);
        
        this.cameras.main.setBounds(0, 0, 1600, 600);
          
        //this.map = this.add.tilemap('map');
        //this.tileset = this.map.addTilesetImage('kafelki', 'tiles');
        //this.layer = this.map.createStaticLayer('floor', this.tileset, 0, 0);
        //this.layer.setCollisionByExclusion([0]);
        //map.setCollisionBetween(1337, 1338, true, layer, true); 
        this.physics.world.bounds.width = 1600; //this.layer.width;
        this.physics.world.bounds.height = 600; //this.layer.height;
        //this.physics.enable(layer);
        //layer.setCollisionBetween(1300, 1400, true);

        this.bgm = this.sound.add('music', {loop: true});
        this.bgm.play();
    }

    createPlayer()
    {     
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setOffset(0, 0);
        this.player.setCollideWorldBounds(true); 
        this.player.setActive(true);

        this.hitSound = this.sound.add('hit');
        this.cameras.main.startFollow(this.player);
        //this.physics.add.collider(this.layer, this.player);
    
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

        this.anims.create({
            key: 'hurt',
            frames: this.anims.generateFrameNumbers('player', { start: 26, end: 27 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNumbers('player', { start: 26, end: 32}),
            frameRate: 10,
            repeat: 0
        })

        this.score = 0;
        this.collectedKeys = 0;
        this.healthPoints = 32;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    }

    createEnemy()
    {       
        this.enemy = this.physics.add.sprite(405, 450, 'enemy_1');
        
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setActive(true);
        this.enemy.setImmovable(true);
        
        this.anims.create({
            key: 'enemy_run',
            frames: this.anims.generateFrameNumbers('enemy_1', {start: 0, end: 2}),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'enemy_die',
            frames: this.anims.generateFrameNumbers('enemy_1', {start: 3, end: 9}),
            frameRate: 10,
            repeat: 0
        });
    
        this.walls = this.physics.add.staticGroup();
    
        this.leftwall = this.walls.create(400, 538, 'invisible-wall');
        this.rightwall = this.walls.create(600, 538, 'invisible-wall');
        this.enemy.setVelocity(100);
        this.physics.add.overlap(this.enemy, this.leftwall, this.enemyTurnRight, null, this);
        this.physics.add.overlap(this.enemy, this.rightwall, this.enemyTurnLeft, null, this);
        
        this.enemyPlayerCollider = this.physics.add.collider(this.enemy, this.player, this.touchEnemy, null, this);
        this.enemy.anims.play('enemy_run');
        this.leftwall.visible = false;
        this.rightwall.visible = false;

        this.enemy.on('animationcomplete', this.animationEnemyDieComplete, this);
    }

    createKeys()
    {
        this.keys = this.add.group();
        this.addKey(Phaser.Math.Between(300, 700), 150);        
        this.physics.add.overlap(this.player, this.keys, this.collectKey, null, this);
    }

    createTreasures()
    {
        this.treasures = this.add.group();
        this.anims.create({
            key: 'treasure_open',
            frames: this.anims.generateFrameNumbers('treasure', {start: 0, end: 3}),
            frameRate: 10,
            repeat: 0
        });
        this.addTreasure(300, 500);
        this.physics.add.overlap(this.player, this.treasures, this.touchTreasure, null, this);
    }

    createFireplaces()
    {
        this.fireplaces = this.add.group();
        this.anims.create({
            key: 'fire-empty',
            frames: this.anims.generateFrameNumbers('fire-empty', {frames: [0]}),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'fire-meat',
            frames: this.anims.generateFrameNumbers('fire-meat', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });
        this.addFireplace(200, 500);
        this.physics.add.overlap(this.player, this.fireplaces, this.touchFireplace, null, this);
    }

    createPlatforms()
    {
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.physics.add.collider(this.keys, this.platforms);    
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemy, this.platforms);
        this.physics.add.collider(this.treasures, this.platforms);
    }

    createHUD()
    {
        this.scoreText = this.add.bitmapText(16, 40, 'number-font', '0');
        this.scoreText.setScrollFactor(0);

        this.add.image(30, 26, 'health-bar-background').setOrigin(0).setScale(1.6).setScrollFactor(0);

        this.healthBars = this.add.group();
        for (let i = 0; i < this.healthPoints; i++)
        {
            var healthBar;
            if (i == 0)
                healthBar = this.add.sprite(32 + i * 6, 26, 'bar-start').setOrigin(0).setScale(1.5).setScrollFactor(0);
            else if (i == this.healthPoints - 1)
                healthBar = this.add.sprite(30 + i * 6, 26, 'bar-end').setOrigin(0).setScale(1.5).setScrollFactor(0);
            else
                healthBar = this.add.sprite(30 + i * 6, 26, 'bar-middle').setOrigin(0).setScale(1.5).setScrollFactor(0);
            this.healthBars.add(healthBar);
        }
        this.add.image(16, 16, 'health-bar-top').setOrigin(0).setScale(1.5).setScrollFactor(0);
    }
    
    addKey(x, y)
    {
        var key;
        key = this.physics.add.sprite(x, y, 'key');
        key.setCollideWorldBounds(true);
        this.keys.add(key);
    }
    
    addTreasure(x, y)
    {
        var treasure;
        treasure = this.physics.add.sprite(x, y, 'treasure');
        treasure.setCollideWorldBounds(true);
        treasure.setImmovable(true);
        treasure.enabled = true;
        this.treasures.add(treasure);
    }

    addFireplace(x, y)
    {
        var fireplace;
        fireplace = this.physics.add.sprite(x, y, 'fire-meat');
        fireplace.setCollideWorldBounds(true);
        fireplace.setImmovable(true);
        fireplace.anims.play('fire-meat', true);
        fireplace.enabled = true;
        this.fireplaces.add(fireplace);
    }
    
    update() 
    {
        if (this.cursors.right.isDown) 
        {
            this.player.setVelocityX(160);
            this.player.scaleX = 1;
            this.player.setOffset(0, 0);
        }
        else if (this.cursors.left.isDown) 
        {
            this.player.setVelocityX(-160);
            this.player.scaleX = -1;
            this.player.setOffset(99, 0);
        }
        else
            this.player.setVelocityX(0);

        if ((this.player.body.onFloor() || this.player.body.touching.down))
        {
            if (this.cursors.right.isDown || this.cursors.left.isDown)
                this.player.anims.play('run', true);
            else
                this.player.anims.play('idle', true);
    
            if (this.cursors.up.isDown)
                this.player.setVelocityY(-330);
        }
        else 
        {
            if (Math.round(this.player.body.velocity.y) < 0)
                this.player.anims.play('jump', true);
            else
                this.player.anims.play('fall', true);
        }
    }
    
    enemyTurnLeft()
    {
        this.enemy.setVelocityX(-100);
        this.enemy.scaleX = -1;
        this.enemy.setOffset(78, 0);
    }
    
    enemyTurnRight()
    {
        this.enemy.setVelocityX(100);
        this.enemy.scaleX = 1;
        this.enemy.setOffset(0, 0);
    }
    
    touchEnemy()
    {
        this.hitSound.play();
        if (this.enemy.body.touching.up && this.player.body.touching.down)
        {
            this.enemy.anims.play('enemy_die');   
            this.score += 50;
            this.scoreText.setText(this.score);
            this.enemy.setVelocityX(0);
            this.enemy.setVelocityY(-50);
            this.player.setVelocityY(-280);
            this.enemyPlayerCollider.destroy();
        }
        else
        {
            this.loseHealth();
            //this.player.setTint(0xff0000);
            /*
            this.player.anims.play('hurt');
            if (this.player.body.touching.left)
            {
                this.player.setVelocityX(200);
                this.player.setAccelerationX(-200);
            }
            
            else if (this.player.body.touching.right)
            {
                this.player.setVelocityX(-200);
                this.player.setAccelerationX(200);
            } */
            //this.physics.pause();
            //this.player.setTint(0xff0000);
            //this.gameOver = true;
        }
    }

    touchTreasure(player, treasure)
    {
        if (this.zKey.isDown && this.collectedKeys > 0 && treasure.enabled)
        {
            this.hitSound.play();
            this.collectedKeys--;
            treasure.anims.play('treasure_open');
            this.score += 1000;
            this.scoreText.setText(this.score);
            treasure.enabled = false;
        } 
    }

    touchFireplace(player, fireplace)
    {
        if (this.zKey.isDown && fireplace.enabled && this.healthPoints < 32)
        {
            this.hitSound.play();
            this.gainHealth();
            fireplace.anims.play('fire-empty');
            fireplace.setOffset(0, -23);
            fireplace.enabled = false;
        }
    }

    animationEnemyDieComplete(animation, frame, enemy)
    {
        if (animation.key == 'enemy_die')
            enemy.disableBody(true, true);
    }
    
    collectKey(player, key)
    {
        this.hitSound.play();
        key.disableBody(true, true); 
        this.collectedKeys++;
        /*
        if (this.keys.countActive(true) === 0)
        {
            this.keys.children.iterate(function (child) {    
                child.enableBody(true, Phaser.Math.Between(300, 790), 150, true, true);
            });
        } */
    }

    gainHealth()
    {
        if (this.healthPoints < 32)
        {
            var result;
            if (this.healthPoints + 10 > 32)
                result = 32;
            else
                result = this.healthPoints + 10;

            var bars = this.healthBars.getChildren();
            for (let i = this.healthPoints - 1; i < result - 1; i++)
            {
                bars[i].setTexture('bar-middle');
                bars[i].visible = true;
            }
            bars[result - 1].setTexture('bar-end');
            bars[result - 1].visible = true;

            this.healthPoints = result;
        }
    }

    loseHealth()
    {
        if (this.healthPoints > 0)
        {
            this.healthPoints--;
            var bars = this.healthBars.getChildren();
            bars[this.healthPoints].visible = false;
            bars[this.healthPoints - 1].setTexture('bar-end');
        }
    }
}

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
    scene: [GameScene]
};

var game = new Phaser.Game(config);