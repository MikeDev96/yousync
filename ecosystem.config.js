module.exports = {
  apps: [
    {
      name: "yousync-server",
      script: "./index.js",
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      time: true,
    },
  ],
}