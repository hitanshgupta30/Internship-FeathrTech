function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function run() {
  await delay(3000);
  console.log("3 seconds completed");
}

run();