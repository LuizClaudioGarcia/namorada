module.exports = {
  apps : [
      {
        name: "BotVirtualSeg",
        script: "./src/index.js",
        watch: true,
        ignore_watch: "tokens",
      }
  ]
}