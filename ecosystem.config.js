module.exports = {
  apps: [
    {
      name: "kiosk-kalkulator",
      script: "node_modules/.bin/next",
      args: "start -p 3002",
      cwd: "/home/korisnik/kiosk-ponude-app",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      error_file: "/home/korisnik/kiosk-ponude-app/logs/error.log",
      out_file: "/home/korisnik/kiosk-ponude-app/logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
