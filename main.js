var fs = require("fs");
const readline = require("readline");
const ORGANIZATIONS = require("./data/organizations.json");
const TICKETS = require("./data/tickets.json");
const USERS = require("./data/users.json");
const ACTION = {
  describe: "describe",
  table: "table",
  search: "search",
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getInfoOrganization = ({ result = [], typeData }) => {
  console.log("getInfoOrganization---", result, typeData);
  result.map((item) => {});
};

const searchData = ({ data, field, value }) => {
  const result = data.filter((o) => {
    if (Array.isArray(o[field])) {
      return o[field].includes(value);
    }
    return o[field] === value;
  });
  if (!result) {
    return [];
  }
  return result;
};

const PrintDescribe = (data) => {
  if (!data[0]) {
    console.log("Not found: 404");
    return;
  }
  console.log(JSON.stringify(data[0], null, 2));
};

const PrintTable = ({ data, typeData, field, value }) => {
  const result = searchData({ data, field, value });
  switch (typeData) {
    case "organizations":
      getInfoOrganization({ result, typeData });
      break;
    case "users":
      getInfoOrganization({ result, typeData });
      break;
    case "tickets":
      getInfoOrganization({ result, typeData });
      break;

    default:
      break;
  }
};

const PrintSearch = ({ data, field, value }) => {
  const result = searchData({ data, field, value });
  if (!result) {
    console.log("Result not found!");
    requestQuestion();
  }
  const formatResponse = {
    number_of_result: result.length,
    search_result: result,
  };
  console.log(JSON.stringify(formatResponse, null, 2));
};

const handleAction = ({ action, typeData, field, value }) => {
  const data =
    typeData === "organizations"
      ? ORGANIZATIONS
      : typeData === "users"
      ? USERS
      : TICKETS;
  switch (action) {
    case ACTION.describe:
      PrintDescribe(data);
      break;
    case ACTION.table:
      PrintTable({ data, field, value, typeData });
      break;
    case ACTION.search:
      PrintSearch({ data, field, value });
      break;
    default:
      console.log("Not found: 404");
      requestQuestion();
      break;
  }
  requestQuestion();
};

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
    const [action, typeData, params] = input.split("-");
    let field;
    let value;
    if (params) {
      [field, value] = params?.split("=");
    }
    handleAction({ action, typeData, field, value });
  });
};

//EXECUTE MAIN
requestQuestion();
