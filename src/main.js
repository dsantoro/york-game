import Phaser from "phaser";
import yorkieSpriteSheet from "../assets/Yorkie Adventure Sprite Sheet.png";
import backgroundImage from "../assets/image.png";
import platformImage from "../assets/platform.png";
import boneImage from "../assets/bone.png";
import groundImage from "../assets/ground.png";
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
    this.load.image("platform", platformImage);
    this.load.image("bone", boneImage);
    this.load.image("ground", groundImage);
  }

  create() {
    const { width, height } = this.scale;
    const floorY = height - 48;
    this.levelWidth = 3600;

    this.createBackground(width, height);

    this.physics.world.setBounds(0, 0, this.levelWidth, height);
    this.physics.world.gravity.y = 1100;

    const floor = this.add
      .rectangle(this.levelWidth / 2, floorY, this.levelWidth, 4, 0xe7e7e7)
      .setVisible(false);
    this.physics.add.existing(floor, true);
    this.add
      .tileSprite(
        this.levelWidth / 2,
        floorY + (height - floorY) / 2,
        this.levelWidth,
        height - floorY,
        "ground",
      )
      .setTileScale(0.5)
      .setDepth(-1);

    const playerScale = 0.4;
    this.player = this.physics.add.sprite(width / 2, floorY - 49, "yorkie", 4);
    this.player.setScale(playerScale);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(260, 145);
    this.player.body.setOffset(62, 150);
    this.physics.add.collider(this.player, floor);
    this.createPlatforms(floorY);
    this.physics.add.overlap(
      this.player,
      this.bones,
      this.collectBone,
      undefined,
      this,
    );

    this.collectedBones = 0;
    this.totalBones = this.bones.countActive(true);
    this.add
      .rectangle(16, 16, 112, 42, 0x412c4d, 0.84)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100);
    this.add
      .image(39, 37, "bone")
      .setDisplaySize(18, 7)
      .setScrollFactor(0)
      .setDepth(101);
    this.boneCounter = this.add
      .text(56, 24, `0 / ${this.totalBones}`, {
        fontFamily: "sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(101);

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

    this.gameStarted = false;
    this.player.body.moves = false;
    this.createStartPopup(width, height);
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

  createPlatforms(floorY) {
    const layouts = [
      { x: 700, elevation: 75 },
      { x: 1250, elevation: 95 },
      { x: 1800, elevation: 65 },
      { x: 2350, elevation: 105 },
      { x: 2900, elevation: 80 },
      { x: 3400, elevation: 90 },
    ];
    const platformWidth = 220;
    const platformHeight = 108;
    this.bones = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    for (const { x, elevation } of layouts) {
      const surfaceY = floorY - elevation;
      const imageY = surfaceY + platformHeight * 0.16;
      this.add
        .image(x, imageY, "platform")
        .setDisplaySize(platformWidth, platformHeight)
        .setDepth(1);
      const collider = this.add.rectangle(
        x,
        surfaceY + 8,
        platformWidth - 20,
        16,
        0xffffff,
        0,
      );
      this.physics.add.existing(collider, true);
      this.physics.add.collider(this.player, collider);

      const bone = this.bones.create(x, surfaceY - 32, "bone");
      bone.setDisplaySize(40, 14.5);
      bone.body.setAllowGravity(false);
      bone.body.setImmovable(true);
      this.tweens.add({
        targets: bone,
        y: bone.y - 7,
        duration: 650,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  collectBone(player, bone) {
    bone.destroy();
    this.collectedBones += 1;
    this.boneCounter.setText(`${this.collectedBones} / ${this.totalBones}`);
  }

  createStartPopup(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const popup = this.add.container(0, 0).setScrollFactor(0).setDepth(200);
    const content = this.add
      .container(centerX * 0.4, centerY * 0.4)
      .setScale(0.6);
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x172138, 0.72)
      .setOrigin(0);
    const panel = this.add.graphics();
    panel.fillStyle(0x28203f, 1);
    panel.fillRect(centerX - 313, centerY - 203, 650, 430);
    panel.fillStyle(0xffe6a3, 1);
    panel.fillRect(centerX - 325, centerY - 215, 650, 430);
    panel.lineStyle(8, 0x352849, 1);
    panel.strokeRect(centerX - 325, centerY - 215, 650, 430);
    panel.fillStyle(0xf4775b, 1);
    panel.fillRect(centerX - 317, centerY - 207, 48, 10);
    panel.fillRect(centerX + 269, centerY + 207, 48, 10);
    panel.fillStyle(0x73c6bb, 1);
    panel.fillRect(centerX + 269, centerY - 207, 48, 10);
    panel.fillRect(centerX - 317, centerY + 207, 48, 10);
    panel.fillStyle(0xfffcdf, 1);
    panel.fillRect(centerX - 295, centerY - 185, 590, 390);

    const title = this.add
      .text(centerX - 95, centerY - 140, "Taylor's", {
        fontFamily: "monospace",
        fontSize: "42px",
        fontStyle: "bold",
        color: "#463253",
        stroke: "#463253",
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    const titleSecondLine = this.add
      .text(centerX - 95, centerY - 93, "adventure!", {
        fontFamily: "monospace",
        fontSize: "31px",
        fontStyle: "bold",
        color: "#e76f51",
        stroke: "#e76f51",
        strokeThickness: 1,
      })
      .setOrigin(0.5);
    const subtitle = this.add
      .text(centerX - 95, centerY - 56, "A CAÇADA AOS OSSINHOS", {
        fontFamily: "monospace",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#55736c",
      })
      .setOrigin(0.5);
    const mascotShadow = this.add
      .ellipse(centerX + 210, centerY - 91, 110, 17, 0x8e7257, 0.28)
      .setOrigin(0.5);
    const mascot = this.add
      .image(centerX + 210, centerY - 120, "yorkie", 4)
      .setDisplaySize(116, 103);
    this.tweens.add({
      targets: mascot,
      y: mascot.y - 7,
      duration: 550,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    const sparkleLeft = this.add
      .rectangle(centerX + 137, centerY - 169, 9, 9, 0xf3a712)
      .setAngle(45);
    const sparkleRight = this.add
      .rectangle(centerX + 279, centerY - 151, 7, 7, 0x54b8aa)
      .setAngle(45);

    const controlsHeading = this.add
      .text(centerX, centerY - 27, "COMO JOGAR", {
        fontFamily: "monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#463253",
      })
      .setOrigin(0.5);

    const controls = [
      { x: centerX - 210, key: "A  ←", action: "ESQUERDA", color: 0xd9eee0 },
      { x: centerX, key: "D  →", action: "DIREITA", color: 0xdcecf2 },
      {
        x: centerX + 210,
        key: "W  ↑  ESPAÇO",
        action: "PULAR",
        color: 0xf9dfd0,
      },
    ];
    const controlObjects = controls.flatMap(({ x, key, action, color }) => {
      const card = this.add.graphics();
      card.fillStyle(0x55435f, 1);
      card.fillRect(x - 82, centerY + 5, 164, 92);
      card.fillStyle(color, 1);
      card.fillRect(x - 86, centerY + 1, 164, 92);
      card.lineStyle(4, 0x55435f, 1);
      card.strokeRect(x - 86, centerY + 1, 164, 92);
      return [
        card,
        this.add
          .text(x - 4, centerY + 34, key, {
            fontFamily: "monospace",
            fontSize: key.length > 8 ? "13px" : "20px",
            fontStyle: "bold",
            color: "#40334b",
          })
          .setOrigin(0.5),
        this.add
          .text(x - 4, centerY + 70, action, {
            fontFamily: "monospace",
            fontSize: "12px",
            fontStyle: "bold",
            color: "#5c5260",
          })
          .setOrigin(0.5),
      ];
    });

    const buttonShadow = this.add
      .rectangle(centerX, centerY + 165, 250, 58, 0x352849)
      .setOrigin(0.5);
    const startButton = this.add
      .rectangle(centerX, centerY + 159, 250, 58, 0xf4775b)
      .setStrokeStyle(5, 0x352849)
      .setInteractive({ useHandCursor: true });
    const startLabel = this.add
      .text(centerX, centerY + 158, "START GAME  ▶", {
        fontFamily: "monospace",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    startButton.on("pointerover", () => startButton.setFillStyle(0xff916d));
    startButton.on("pointerout", () => startButton.setFillStyle(0xf4775b));
    startButton.on("pointerdown", () => {
      this.gameStarted = true;
      this.player.body.moves = true;
      popup.destroy();
    });

    content.add([
      panel,
      title,
      titleSecondLine,
      subtitle,
      mascotShadow,
      mascot,
      sparkleLeft,
      sparkleRight,
      controlsHeading,
      ...controlObjects,
      buttonShadow,
      startButton,
      startLabel,
    ]);
    popup.add([overlay, content]);
  }

  update() {
    if (!this.gameStarted) return;

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
