var fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const requestQuestion = () => {
  rl.question("Please enter your selection (help | quit): ", (input) => {
    if (input === "quit") {
      rl.close();
    }
    if (input === "help") {
      fs.readFile("help.txt", "utf8", function (err, data) {
        // Display the file content
        if (err) {
          console.log("Read file error: ", err);
        }
        console.log(data);
        requestQuestion();
      });
      return;
    }
  });
};

//EXECUTE MAIN
requestQuestion();
