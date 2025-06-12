const { exec } = require("child_process");

exec(
  "mkdir -p src/assets/configs && cp -n configs/config.sample.json src/assets/configs/config.json",
  (error, stdout, stderr) => {
    if (error || stderr) {
      return;
    }
    console.log(`config copied`);
  },
);
