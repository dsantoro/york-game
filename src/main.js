import Phaser from "phaser";
import yorkieSpriteSheet from "../assets/Yorkie Adventure Sprite Sheet.png";
import backgroundImage from "../assets/image.png";
import "./style.css";

class PlatformScene extends Phaser.Scene {
  constructor() {
    super("platform");
  }

  preload() {
    this.load.spritesheet("yorkie", yorkieSpriteSheet, {
      frameWidth: 384,
      frameHeight: 341,
    });
    this.load.image("background", backgroundImage);
  }

  create() {
    const { width, height } = this.scale;
    const floorY = height - 48;
    this.levelWidth = 3600;

    this.createBackground(width, height);

    this.physics.world.setBounds(0, 0, this.levelWidth, height);
    this.physics.world.gravity.y = 1100;

    const floor = this.add.rectangle(
      this.levelWidth / 2,
      floorY,
      this.levelWidth,
      4,
      0xe7e7e7,
    );
    this.physics.add.existing(floor, true);

    const playerScale = 0.4;
    this.player = this.physics.add.sprite(width / 2, floorY - 49, "yorkie", 4);
    this.player.setScale(playerScale);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(260, 145);
    this.player.body.setOffset(62, 150);
    this.physics.add.collider(this.player, floor);

    this.cameras.main.setBounds(0, 0, this.levelWidth, height);
    this.cameras.main.startFollow(this.player, false, 1, 1);

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("yorkie", { start: 0, end: 3 }),
      frameRate: 9,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.W,
    });
  }

  createBackground(width, height) {
    const source = this.textures.get("background").getSourceImage();
    const parallax = 0.15;
    const requiredWidth = width + (this.levelWidth - width) * parallax;
    const scale = Math.max(
      requiredWidth / source.width,
      height / source.height,
    );

    this.add
      .image(0, (height - source.height * scale) / 2, "background")
      .setOrigin(0, 0)
      .setDisplaySize(source.width * scale, source.height * scale)
      .setScrollFactor(parallax, 0)
      .setDepth(-10);
  }

  update() {
    const movingLeft = this.cursors.left.isDown || this.keys.left.isDown;
    const movingRight = this.cursors.right.isDown || this.keys.right.isDown;
    const direction = Number(movingRight) - Number(movingLeft);
    const grounded =
      this.player.body.blocked.down || this.player.body.touching.down;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jump);

    this.player.setVelocityX(direction * 280);

    if (direction !== 0) {
      this.player.setFlipX(direction < 0);
    }

    if (grounded && jumpPressed) {
      this.player.setVelocityY(-520);
    }

    if (!grounded || (jumpPressed && this.player.body.velocity.y < 0)) {
      this.player.anims.stop();
      this.player.setFrame(9);
    } else if (direction !== 0) {
      this.player.play("run", true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(4);
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-canvas",
  backgroundColor: "#d279a9",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: PlatformScene,
});
