class WelcomeScene extends Phaser.Scene
{
    constructor()
    {
        super({key: 'WelcomeScene'});
    }

    preload()
    {
        this.load.image('sky', 'assets/sky-1.png');
        this.load.image('clouds', 'assets/cloud-1.png');
        this.load.image('background-2', 'assets/background-2.png');
        this.load.image('standard-font-2', 'assets/font-20x20.png');
        this.load.image('title-font', 'assets/title-font.png');       
        this.load.audio('welcome-music', 'assets/theme-2.ogg');
    }

    create()
    {
        this.music = this.sound.add('welcome-music', {loop: true});
        this.music.play();

        this.sky = this.add.image(400, 300, 'sky');

        this.clouds = [];
        this.clouds[0] = this.physics.add.sprite(0, 0, 'clouds');
        this.clouds[0].setOrigin(0);
        this.clouds[0].body.setAllowGravity(false);
        this.clouds[0].setVelocityX(-100);

        this.clouds[1] = this.physics.add.sprite(800, 0, 'clouds');
        this.clouds[1].setOrigin(0);
        this.clouds[1].body.setAllowGravity(false);
        this.clouds[1].setVelocityX(-100);
        
        this.background = this.add.image(400, 300, 'background-2');

        var config = {
            image: 'standard-font-2',
            width: 20,
            height: 20,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET1,
            charsPerRow: 15
        };
        this.cache.bitmapFont.add('standard-font-2', Phaser.GameObjects.RetroFont.Parse(this, config));

        config = {
            image: 'title-font',
            width: 35,
            height: 37,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET3,
            charsPerRow: 15
        };
        this.cache.bitmapFont.add('title-font', Phaser.GameObjects.RetroFont.Parse(this, config));

        this.title = this.add.bitmapText(400, 300, 'title-font', 'PREHISTORIC\nPLATFORMER');
        this.title.setOrigin(0.5);
        this.title.setCenterAlign();
        this.title.setAlpha(0);

        this.text = this.add.bitmapText(400, 400, 'standard-font-2', 'Wcisnij dowolny klawisz');
        this.text.setOrigin(0.5);
        this.text.setCenterAlign();
        this.text.setAlpha(0);

        this.tweens.add({
            targets: this.title,
            y: 200,
            alpha: 1,
            duration: 3000,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: this.text,
            alpha: 1,
            yoyo: true,
            duration: 2000,
            ease: 'Power1',
            repeat: -1,
            delay: 3000,
        });
        
        this.input.keyboard.on('keydown', function() {
            this.music.stop();
            this.scene.start('GameScene');
        }, this);
    }

    update()
    {
        if (this.clouds[0].body.x <= -800)
        {
            this.clouds[0].setPosition(796, 0);
            this.clouds[0].setVelocityX(-100);
        }

        if (this.clouds[1].body.x <= -800)
        {
            this.clouds[1].setPosition(796, 0);
            this.clouds[1].setVelocityX(-100);
        }
    }
}

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
        this.load.image('health-bar-background', 'assets/health-bar-backgound.png');
        this.load.image('health-bar-top', 'assets/health-bar-top-1.png');
        this.load.image('bar-start', 'assets/bar-start.png');
        this.load.image('bar-middle', 'assets/bar-middle.png');
        this.load.image('bar-end', 'assets/bar-end.png');

        this.load.spritesheet('tiles', 'assets/tileset-1.png', {frameWidth: 16, frameHeight: 16});
        this.load.tilemapTiledJSON('map', 'assets/map.json');

        this.load.spritesheet('player', 'assets/girl-2.png', {frameWidth: 99, frameHeight: 74});
        this.load.spritesheet('enemy_1', 'assets/insect-1.png', {frameWidth: 78, frameHeight: 69});
        this.load.spritesheet ('fragile-block', 'assets/fragile-block.png', {frameWidth: 40, frameHeight: 44});
        this.load.spritesheet('treasure', 'assets/chest.png', {frameWidth: 60, frameHeight: 36});
        this.load.spritesheet('fire-empty', 'assets/fire.png', {frameWidth: 83, frameHeight: 32});
        this.load.spritesheet('fire-meat', 'assets/fire-meat.png', {frameWidth: 84, frameHeight: 55});
        this.load.spritesheet('bumper', 'assets/bumper.png', {frameWidth: 64, frameHeight: 26});
        this.load.spritesheet('enemy_2', 'assets/mini-tyranausor-2.png', {frameWidth: 80, frameHeight: 62});
        this.load.spritesheet('enemy_3', 'assets/plant-1.png', {frameWidth: 135, frameHeight: 85});

        this.load.image('standard-font', 'assets/font.png');
        this.load.bitmapFont('number-font', 'assets/font-number-40x40-export.png', 'assets/font-number-40x40-export.xml');

        this.load.audio('music', 'assets/theme-1.ogg');
        this.load.audio('hit-1', 'assets/hit-1.wav');
        this.load.audio('hit-2', 'assets/hit-2.wav')
        this.load.audio('wood-1', 'assets/wood-1.wav');
        this.load.audio('wood-2', 'assets/wood-2.wav');
    }
    
    create() 
    {
        this.createWorld();
        this.createPlayer();  
        this.createEnemies();
        this.createKeys();    
        this.createTreasures();
        this.createFireplaces();
        this.createBumpers();
        this.createFragileBlocks();
        this.createHUD();
    }

    update() 
    {
        if (!this.player.dead)
        {
            if (this.cursors.right.isDown) 
            {
                this.player.setVelocityX(160);
                this.player.scaleX = 1;
                this.player.setOffset(this.player.baseOffset, 0);
            }
            else if (this.cursors.left.isDown) 
            {
                this.player.setVelocityX(-160);
                this.player.scaleX = -1;
                this.player.setOffset(this.player.baseOffset + this.player.body.sourceWidth, 0);
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
                    this.player.setVelocityY(-280);
            }
            else 
            {
                if (Math.round(this.player.body.velocity.y) < 0)
                    this.player.anims.play('jump', true);
                else
                    this.player.anims.play('fall', true);
            }
        }

        if (this.player.body.x >= 4700)
            this.finish();
    }

    createWorld()
    {
        this.background = this.add.tileSprite(800, 300, 1600, 600, 'background');
        this.background.setScrollFactor(0.2);
        
        this.cameras.main.setBounds(0, 0, 4800, 600);
        this.map = this.add.tilemap('map');
        this.tileset = this.map.addTilesetImage('tileset-1', 'tiles');
        this.layer = this.map.createStaticLayer('Tile Layer 1', this.tileset, 0, 0);     
        this.layer2 = this.map.createStaticLayer('Tile Layer 2', this.tileset, 0, 0);
        this.layer3 = this.map.createStaticLayer('block', this.tileset, 0, 0);
        this.layer4 = this.map.createStaticLayer('bad', this.tileset, 0, 0);

        this.physics.world.bounds.width = this.layer.width;
        this.physics.world.bounds.height = this.layer.height;
        
        this.layer.setCollisionBetween(1060, 1063);
        this.layer3.setCollisionBetween(946,947);
        this.layer4.setCollisionBetween(853,856);

        this.finished = false;

        this.bgm = this.sound.add('music', {loop: true});
        this.bgm.play();
    }

    createPlayer()
    {     
        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setOrigin(0.5, 0);
        this.player.setCollideWorldBounds(true); 
        this.player.setActive(true);
        this.player.body.setSize(52, 68, true);
        this.player.body.offset.y = 0;
        this.player.baseOffset = this.player.body.offset.x;
        this.player.dead = false;

        this.hitSound1 = this.sound.add('hit-1');
        this.hitSound2 = this.sound.add('hit-2');
        this.cameras.main.startFollow(this.player);

        this.physics.add.collider(this.player, this.layer3);
        this.physics.add.collider(this.player, this.layer);
        this.physics.add.collider(this.player, this.layer4, this.touchObstacle, null, this);
    
        this.player.on('animationcomplete', this.animationPlayerDieComplete, this);

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
            key: 'die',
            frames: this.anims.generateFrameNumbers('player', { start: 26, end: 32}),
            frameRate: 10,
            repeat: 0
        });

        this.score = 0;
        this.collectedKeys = 0;
        this.healthPoints = 32;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    }

    createHUD()
    {
        this.scoreText = this.add.bitmapText(16, 40, 'number-font', '0');
        this.scoreText.setScrollFactor(0);

        var config = {
            image: 'standard-font',
            width: 40,
            height: 40,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET1,
            charsPerRow: 15
        };
        this.cache.bitmapFont.add('standard-font', Phaser.GameObjects.RetroFont.Parse(this, config));

        this.add.image(16, 150, 'key').setOrigin(0).setScale(1.5).setScrollFactor(0);
        this.keyText = this.add.bitmapText(70, 140, 'standard-font', '0');
        this.keyText.setScrollFactor(0);

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

    createEnemies()
    {       
        this.enemies = this.add.group();
        
        /* nowe animacje powinny mieć format enemy_<numer>_<rodzaj> */
        /* wtedy jedyne co trzeba zrobić, aby stworzyć potwora, to dodać jedną linijkę, a on sam będzie wybierał swoje animacje */
        this.anims.create({
            key: 'enemy_1_run',
            frames: this.anims.generateFrameNumbers('enemy_1', {start: 0, end: 2}),
            frameRate: 10,
            repeat: -1
        });  
        this.anims.create({
            key: 'enemy_1_die',
            frames: this.anims.generateFrameNumbers('enemy_1', {start: 6, end: 9}),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'enemy_2_run',
            frames: this.anims.generateFrameNumbers('enemy_2', {start: 6, end: 11}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy_2_die',
            frames: this.anims.generateFrameNumbers('enemy_2', {start: 15, end: 22}),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'enemy_3_run',
            frames: this.anims.generateFrameNumbers('enemy_3', {start: 0, end: 5}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy_3_die',
            frames: this.anims.generateFrameNumbers('enemy_3', {start: 12, end: 23}),
            frameRate: 10,
            repeat: 0
        });

        this.walls = this.physics.add.staticGroup();

        /* generowanie wrogów */
        /* 520 - wysokość podłogi */
        this.addEnemy(400, 600, 530, 'enemy_1');
        this.addEnemy(1000, 1300, 530, 'enemy_3', 80);
        this.addEnemy(1400, 1900, 530, 'enemy_2', 64);
        this.addEnemy(2400, 2700, 530, 'enemy_3', 80);
        this.addEnemy(3000, 3500, 530, 'enemy_2', 64);
        this.addEnemy(3700, 3900, 530, 'enemy_1');
        this.addEnemy (4100, 4300, 530, 'enemy_2', 64);

        /* ================== */
        this.physics.add.collider(this.player, this.enemies, this.touchEnemy, null, this);
        this.physics.add.collider(this.layer, this.enemies);
    }

    /* xStart, xEnd - współrzędne między którymi spaceruje przeciwnik */
    /* bodyWidth - jak body sprite'a jest za szerokie, trzeba je zmniejszyć */
    addEnemy(xStart, xEnd, y, spriteKey, bodyWidth = 0)
    {
        var enemy, leftwall, rightwall;
        enemy = this.physics.add.sprite(xStart + (xEnd - xStart) / 2, y, spriteKey).setOrigin(0.5, 1);
        
        enemy.setCollideWorldBounds(true);
        enemy.setActive(true);
        enemy.setImmovable(true);
        
        if (bodyWidth)
            enemy.body.setSize(bodyWidth);

        enemy.baseOffset = enemy.body.offset.x;

        leftwall = this.walls.create(xStart, y - 5, 'invisible-wall').setOrigin(1);
        rightwall = this.walls.create(xEnd, y - 5, 'invisible-wall').setOrigin(1);
        this.physics.add.overlap(leftwall, enemy, this.enemyTurnRight, null, this);
        this.physics.add.overlap(rightwall, enemy, this.enemyTurnLeft, null, this);

        enemy.setVelocity(100);
        enemy.spriteKey = spriteKey;
        enemy.anims.play(spriteKey + '_run');
        leftwall.visible = false;
        rightwall.visible = false;
        enemy.enabled = true;
        enemy.on('animationcomplete', this.animationEnemyDieComplete, this);

        this.enemies.add(enemy);
    }

    createKeys()
    {
        this.keys = this.add.group();
        /* generowanie kluczy */
        this.addKey(500, 530);
        this.addKey(1200, 150);
        this.addKey (1500, 150);
        this.addKey(2500, 530);
        this.addKey(3600, 530);
        this.addKey (4150, 530);
        
        /* ================== */
        this.physics.add.overlap(this.player, this.keys, this.collectKey, null, this);
    }
    
    addKey(x, y)
    {
        var key;
        key = this.physics.add.sprite(x, y - 10, 'key');
        key.setOrigin(0.5, 1);
        key.body.setAllowGravity(false);
        key.setImmovable(true);
        this.keys.add(key);
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
        /* generowanie skarbów */
        this.addTreasure(300, 530);
        this.addTreasure(1500, 530);
        this.addTreasure(1100, 530);
        this.addTreasure(2250, 530);
        this.addTreasure(3100, 160);
        this.addTreasure(4450, 530);

        /* =================== */
        this.physics.add.overlap(this.player, this.treasures, this.touchTreasure, null, this);
    }  
    
    addTreasure(x, y)
    {
        var treasure;
        treasure = this.physics.add.sprite(x, y, 'treasure');
        treasure.setOrigin(0.5, 1);
        treasure.body.setAllowGravity(false);
        treasure.setImmovable(true);
        treasure.enabled = true;
        this.treasures.add(treasure);
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
        /* generowanie ognisk */
        this.addFireplace(200, 530);
        this.addFireplace(2950, 530); 

        /* ================== */
        this.physics.add.overlap(this.player, this.fireplaces, this.touchFireplace, null, this);
    }

    addFireplace(x, y)
    {
        var fireplace;
        fireplace = this.physics.add.sprite(x, y, 'fire-meat');
        fireplace.setOrigin(0.5, 1);
        fireplace.body.setAllowGravity(false);
        fireplace.setImmovable(true);
        fireplace.anims.play('fire-meat', true);
        fireplace.enabled = true;
        this.fireplaces.add(fireplace);
    }

    createBumpers()
    {
        this.bumpers = this.add.group();

        this.anims.create({
            key: 'bumper-jump',
            frames: this.anims.generateFrameNumbers('bumper', {frames: [1, 2, 3, 4, 0]}),
            frameRate: 10,
            repeat: 0
        });
        /* generowanie skoczni */
        this.addBumper(900, 530);
        this.addBumper(3450, 530);

        /* =================== */
        this.physics.add.collider(this.player, this.bumpers, this.touchBumper, null, this);
    }

    addBumper(x, y)
    {
        var bumper;
        bumper = this.physics.add.sprite(x, y, 'bumper');
        bumper.setOrigin(0.5, 1);
        bumper.body.setAllowGravity(false);
        bumper.setImmovable(true);
        this.bumpers.add(bumper);
    }

    createFragileBlocks()
    {
        this.stepIdx = 0;
        this.woodSteps = [];
        this.woodSteps[0] = this.sound.add('wood-1');
        this.woodSteps[1] = this.sound.add('wood-2');
        this.fragileBlocks = this.add.group();

        this.anims.create({
            key: 'block-destroy',
            frames: this.anims.generateFrameNumbers('fragile-block', {start: 0, end: 8}),
            frameRate: 10,
            repeat: 0
        });
        /* generowanie znikających bloków */
        for (let i = 0; i < 20; i++)
            this.addFragileBlock(1000 + i * 32, 150);

        /* ============================== */
        this.physics.add.collider(this.player, this.fragileBlocks, this.touchFragileBlock, null, this);
    }

    addFragileBlock(x, y)
    {
        var fragileBlock;
        fragileBlock = this.physics.add.sprite(x, y, 'fragile-block');
        fragileBlock.setOrigin(0.5, 0);
        fragileBlock.body.setAllowGravity(false);
        fragileBlock.setImmovable(true);
        fragileBlock.body.setSize(32, 32);
        fragileBlock.body.offset.y -= 4;
        fragileBlock.enabled = true;
        fragileBlock.on('animationcomplete', this.animationBlockDestroyComplete, this);
        this.fragileBlocks.add(fragileBlock);
    }
    
    enemyTurnLeft(wall, enemy)
    {
        enemy.setVelocityX(-100);
        enemy.setVelocityY(-5);
        enemy.scaleX = -1;
        enemy.setOffset(enemy.baseOffset + enemy.body.sourceWidth, 0);
    }
    
    enemyTurnRight(wall, enemy)
    {
        enemy.setVelocityX(100);
        enemy.setVelocityY(-5);
        enemy.scaleX = 1;
        enemy.setOffset(enemy.baseOffset, 0);
    }
    
    touchEnemy(player, enemy)
    {
        if (enemy.enabled)
        {
            this.hitSound1.play();
            if (enemy.body.touching.up && player.body.touching.down)
            {
                enemy.anims.play(enemy.spriteKey + '_die');   
                this.score += 50;
                this.scoreText.setText(this.score);
                enemy.setVelocityX(0);
                enemy.setVelocityY(-50);
                player.setVelocityY(-250);
                enemy.enabled = false;
            }
            else
                this.loseHealth();
        }
    }

    touchObstacle()
    {
        this.hitSound1.play();
        this.loseHealth();
    }

    touchTreasure(player, treasure)
    {
        if (this.zKey.isDown && this.collectedKeys > 0 && treasure.enabled)
        {
            this.hitSound2.play();
            this.collectedKeys--;
            treasure.anims.play('treasure_open');
            this.score += 1000;
            this.scoreText.setText(this.score);
            this.keyText.setText(this.collectedKeys);
            treasure.enabled = false;
        } 
    }

    touchFireplace(player, fireplace)
    {
        if (this.zKey.isDown && fireplace.enabled && this.healthPoints < 32)
        {
            this.hitSound2.play();
            this.gainHealth();
            fireplace.anims.play('fire-empty');
            fireplace.setOffset(0, -23);
            fireplace.enabled = false;
        }
    }

    touchBumper(player, bumper)
    {
        if (bumper.body.touching.up && player.body.touching.down)
        {
            this.hitSound2.play();
            player.setVelocityY(-500);
            bumper.anims.play('bumper-jump');
        }
    }

    touchFragileBlock(player, fragileBlock)
    {
        if (fragileBlock.enabled && fragileBlock.body.touching.up && player.body.touching.down)
        {
            if (!this.woodSteps[this.stepIdx].isPlaying)
            {
                this.stepIdx = (this.stepIdx + 1) % this.woodSteps.length;
                this.woodSteps[this.stepIdx].play();
            }
            fragileBlock.anims.play('block-destroy');
            fragileBlock.enabled = false;
        }
    }

    finish()
    {
        if (!this.finished)
        {
            this.physics.pause();
            this.bgm.stop();
            this.finished = true;
            this.scene.launch('CreditScene', { score: this.score });
        }
    }

    animationPlayerDieComplete(animation, frame, player)
    {
        if (animation.key == 'die')
            this.scene.launch('GameOverScene', { score: this.score });
    }

    animationEnemyDieComplete(animation, frame, enemy)
    {
        if (animation.key == enemy.spriteKey + '_die')
            enemy.disableBody(true, true);
    }

    animationBlockDestroyComplete(animation, frame, fragileBlock)
    {
        if (animation.key == 'block-destroy')
            fragileBlock.disableBody(true, true);
    }
    
    collectKey(player, key)
    {
        this.hitSound2.play();
        key.disableBody(true, true); 
        this.collectedKeys++;
        this.keyText.setText(this.collectedKeys);
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
            if (this.healthPoints > 0)
                bars[this.healthPoints - 1].setTexture('bar-end');
        }
        else if (!this.player.dead)
        {
            this.physics.pause();
            this.bgm.stop();
            this.player.dead = true;
            this.player.anims.play('die');
        }
    }
}

class GameOverScene extends Phaser.Scene
{
    constructor()
    {
        super({key: 'GameOverScene'});
    }

    init(data)
    {
        this.score = data.score;
    }

    preload()
    {
        this.load.image('black', 'assets/black.png');
        this.load.audio('gameover-music', 'assets/theme-6.ogg');
    }

    create()
    {
        this.music = this.sound.add('gameover-music', {loop: true});
        this.music.play();

        this.bg = this.add.tileSprite(400, 300, 800, 600, 'black');
        this.bg.setAlpha(0);

        var config = {
            image: 'standard-font-2',
            width: 20,
            height: 20,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET1,
            charsPerRow: 15
        };
        this.cache.bitmapFont.add('standard-font-2', Phaser.GameObjects.RetroFont.Parse(this, config));

        config = {
            image: 'title-font',
            width: 35,
            height: 37,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET3,
            charsPerRow: 15
        };
        this.cache.bitmapFont.add('title-font', Phaser.GameObjects.RetroFont.Parse(this, config));

        this.title = this.add.bitmapText(400, 100, 'title-font', 'PRZEGRANA');
        this.title.setOrigin(0.5);
        this.title.setCenterAlign();
        this.title.setAlpha(0);

        this.result = this.add.bitmapText(400, 300, 'standard-font', 'Wynik: ' + this.score);
        this.result.setOrigin(0.5);
        this.result.setCenterAlign();
        this.result.setAlpha(0);        
    
        this.text = this.add.bitmapText(400, 400, 'standard-font-2', 'Wcisnij dowolny klawisz');
        this.text.setOrigin(0.5);
        this.text.setCenterAlign();
        this.text.setAlpha(0);
        
        this.tweens.add({
            targets: this.bg,
            alpha: 0.5,
            duration: 2000,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: this.title,
            y: 200,
            alpha: 1,
            duration: 3000,
            ease: 'Power2',
            delay: 2000
        });

        this.tweens.add({
            targets: this.result,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
            delay: 5000
        });
   
        this.tweens.add({
            targets: this.text,
            alpha: 1,
            yoyo: true,
            duration: 2000,
            ease: 'Power1',
            repeat: -1,
            delay: 7000,
        });

        this.input.keyboard.on('keydown', function() {
            this.music.stop();
            var scene = this.scene.get('GameScene');
            scene.scene.restart();
            this.scene.stop();
        }, this);
    }

    update()
    {

    }
}

class CreditScene extends Phaser.Scene
{
    constructor()
    {
        super({key: 'CreditScene'});
    }

    init(data)
    {
        this.score = data.score;
    }

    preload()
    {
        this.load.image('black', 'assets/black.png');
        this.load.audio('credits-music', 'assets/theme-7.ogg');
    }

    create()
    {
        this.music = this.sound.add('credits-music', {loop: true});
        this.music.play();

        this.bg = this.add.tileSprite(400, 300, 800, 600, 'black');
        this.bg.setAlpha(0);

        var config = {
            image: 'standard-font-2',
            width: 20,
            height: 20,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET1,
            charsPerRow: 15
        };
        this.cache.bitmapFont.add('standard-font-2', Phaser.GameObjects.RetroFont.Parse(this, config));

        config = {
            image: 'title-font',
            width: 35,
            height: 37,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET3,
            charsPerRow: 15
        };
        this.cache.bitmapFont.add('title-font', Phaser.GameObjects.RetroFont.Parse(this, config));

        this.endRoll = this.add.container(0, 600);

        this.title = this.add.bitmapText(400, 0, 'title-font', 'WYGRANA');
        this.title.setOrigin(0.5, 0);
        this.title.setCenterAlign();

        var bigText = this.add.bitmapText(400, 100, 'standard-font', 'Autorzy');
        bigText.setOrigin(0.5, 0);
        bigText.setCenterAlign();

        var smallText = this.add.bitmapText(400, 150, 'standard-font-2', 'Islamova Elena\nStefanowska Antonina');
        smallText.setOrigin(0.5, 0);
        smallText.setCenterAlign();

        this.endRoll.add([this.title, bigText, smallText]);
        var bigText = this.add.bitmapText(400, 250, 'standard-font', 'Darmowe materialy');
        bigText.setOrigin(0.5, 0);
        bigText.setCenterAlign();

        var smallText = this.add.bitmapText(400, 300, 'standard-font-2', 'Pixel-boy\nPatreon: SparklinLabs');
        smallText.setOrigin(0.5, 0);
        smallText.setCenterAlign();

        this.endRoll.add([bigText, smallText]);
        var smallText = this.add.bitmapText(400, 400, 'standard-font-2', 'Politechnika Białostocka\nWydzial Informatyki\n2018r.');
        smallText.setOrigin(0.5, 0);
        smallText.setCenterAlign();

        var bigText = this.add.bitmapText(400, 500, 'standard-font', 'Wynik: ' + this.score);
        bigText.setOrigin(0.5, 0);
        bigText.setCenterAlign();

        this.endRoll.add([smallText, bigText]);
    
        this.text = this.add.bitmapText(400, 400, 'standard-font-2', 'Wcisnij dowolny klawisz');
        this.text.setOrigin(0.5);
        this.text.setCenterAlign();
        this.text.setAlpha(0);

        this.tweens.add({
            targets: this.bg,
            alpha: 0.5,
            duration: 2000,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: this.endRoll,
            y: -700,
            duration: 20000,
            delay: 2000
        });    
      
        this.tweens.add({
            targets: this.text,
            alpha: 1,
            yoyo: true,
            duration: 2000,
            ease: 'Power1',
            repeat: -1,
            delay: 20000,
        });

        this.input.keyboard.on('keydown', function() {
            this.music.stop();
            var scene = this.scene.get('GameScene');
            scene.scene.stop();
            this.scene.start('WelcomeScene');
        }, this);
    }

    update()
    {

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
            debug: false
        }
    },
    scene: [ WelcomeScene, GameScene, GameOverScene, CreditScene ]
};

var game = new Phaser.Game(config);