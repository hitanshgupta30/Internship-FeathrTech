 function output(ms){
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
 }

 async function execute() {
    await output(2000);
    const random = Math.floor(Math.random() * 100);{
        if(random < 50){
            console.log("Success");
        }
        else{
            console.log("Something went wrong");
        }
    }
 };
 execute();