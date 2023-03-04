const { spawn } = require("child_process");

const GAME_OVER_RESTART_WEBQUAKE_SERVER = 100;

startWebQuakeServer();

function startWebQuakeServer() {
  const child = spawn("node", ["./WebQDS.js"]);

  child.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  child.stderr.on("data", (data) => {
    console.error(data.toString());
  });

  child.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === GAME_OVER_RESTART_WEBQUAKE_SERVER) {
      console.log("Game just ended. Re-starting WebQuake server...");
      startWebQuakeServer();
    }
  });
}
