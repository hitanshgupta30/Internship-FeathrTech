// Promise version
function getData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Hello");
    }, 1000);
  });
}
getData()
  .then((data) => {
    console.log(data);
  });

// Promise version to async/await version

async function getDataAsync() {
    const data = await getData();
    console.log(data);
  }
getDataAsync("Hello");