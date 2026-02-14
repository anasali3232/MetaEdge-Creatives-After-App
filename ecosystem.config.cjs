module.exports = {
  apps: [
    {
      name: "metaedge",
      script: "./dist/index.cjs",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
