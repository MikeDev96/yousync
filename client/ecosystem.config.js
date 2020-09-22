module.exports = {
  name: "yousync",
  script: "serve",
  out_file: "./logs/out.log",
  error_file: "./logs/err.log",
  time: true,
  env: {
    PM2_SERVE_PATH: '.',
    PM2_SERVE_PORT: 5001,
    PM2_SERVE_SPA: 'true',
    PM2_SERVE_HOMEPAGE: '/index.html'
  }
}