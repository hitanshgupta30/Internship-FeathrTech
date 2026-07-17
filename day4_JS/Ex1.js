function getMessage() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Hello Intern!");
    }, 2000);
  });
}

async function displayMessage() {
  try {
    const msg = await getMessage();
    console.log(msg);
  } catch (err) {
    console.log(err);
  }
}

displayMessage();