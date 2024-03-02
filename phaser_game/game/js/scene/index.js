function create() {
  this.game.RoleInfo = {
    money: 0,
    max_health: 3,
  };
  const gamestart = this.add
    .text(800 / 2, 200, `GAME START`, {
      color: "#ff0",
      fontFamily: "Tahoma",
      fontSize: 80,
      resolution: 2,
    })
    .setOrigin(0.5, 0.5);

  this.restart = this.add
    .text(800 / 2, 400, "start", {
      color: "#fff",
      fontFamily: "Tahoma",
      fontSize: 40,
      resolution: 2,
    })
    .setOrigin(0.5, 0.5)
    .setInteractive({ useHandCursor: true })
    .on(
      "pointerup",
      () => {
        this.scene.start("menu");
      },
      this
    )
    .on("pointerover", () => {
      this.restart.alpha = 0.5;
    })
    .on("pointerout", () => {
      this.restart.alpha = 1;
    });

  this.tweens.add({
    targets: gamestart,
    y: { from: 0, to: 100 },
    ease: "Bounce.easeOut",
    duration: 1000,
    repeat: 0,
    yoyo: false,
  });
}

const start = {
  key: "start",
  preload: function () {},
  create: create,
  update: function () {},
};
export default start;
