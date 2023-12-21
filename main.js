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

const getInfoOrganization = ({ result = [] }) => {
  return result.map((item) => {
    const organizationId = item._id;
    const resultUsers = USERS.filter(
      (user) => user.organization_id === organizationId
    ).map((x) => x.name);
    const resultTickets = TICKETS.filter(
      (ticket) => ticket.organization_id === organizationId
    ).map((x) => x.subject);
    return {
      id: item._id,
      name: item.name,
      details: item.details,
      created_at: item.created_at,
      domain_names: item.domain_names.map((i) => i).join(","),
      tags: item.tags.map((i) => i).join(","),
      users: resultUsers.map((i) => i).join(","),
      tickets: resultTickets.map((i) => i).join(","),
    };
  });
};
const getInfoUsers = ({ result = [] }) => {
  return result.map((item) => {
    const resultOrganization = ORGANIZATIONS.filter(
      (organization) => organization._id === item.organization_id
    ).map((x) => x.name);
    const resultAssignedTickets = TICKETS.filter(
      (ticket) => ticket.assignee_id === item._id
    ).map((x) => x.subject);
    const resultSubmittedTickets = TICKETS.filter(
      (ticket) => ticket.submitter_id === item._id
    ).map((x) => x.subject);
    return {
      ...item,
      organization: resultOrganization,
      assignedTickets: resultAssignedTickets,
      submittedTickets: resultSubmittedTickets,
    };
  });
};
const getInfoTickets = ({ result = [] }) => {
  return result.map((ticket) => {
    const resultAssignedTickets = USERS.filter(
      (user) => user._id === ticket.assignee_id
    ).map((x) => x.name);
    const resultSubmittedTickets = USERS.filter(
      (user) => user._id === ticket.submitter_id
    ).map((x) => x.name);
    const resultOrganization = ORGANIZATIONS.filter(
      (organization) => organization._id === ticket.organization_id
    ).map((x) => x.name);
    return {
      ...ticket,
      assignedTickets: resultAssignedTickets,
      submittedTickets: resultSubmittedTickets,
      organization: resultOrganization,
    };
  });
};

const searchData = ({ data, field, value }) => {
  const result = data.filter((item) => {
    if (item[field]) {
      if (Array.isArray(item[field])) {
        return item[field].includes(value);
      }
      return item[field] === value;
    }
  });
  return result;
};

const PrintTable = (data) => {
  console.log("dataTable", JSON.stringify(data, null, 2));
};
const handleTableTypeData = ({ data, typeData, field, value }) => {
  const result = searchData({ data, field, value });
  if (!result || result.length === 0) {
    console.log("Result not found!");
    requestQuestion();
    return;
  }
  switch (typeData) {
    case "organizations":
      const resultInfoOrganization = getInfoOrganization({ result });
      PrintTable(resultInfoOrganization);
      break;
    case "users":
      const resultInfoUsers = getInfoUsers({ result });
      PrintTable(resultInfoUsers);
      break;
    case "tickets":
      const resultInfoTickets = getInfoTickets({ result });
      PrintTable(resultInfoTickets);
      break;
    default:
      break;
  }
};

const PrintDescribe = (data) => {
  if (!data[0]) {
    console.log("Not found: 404");
    return;
  }
  console.log(JSON.stringify(data[0], null, 2));
};

const PrintSearch = ({ data, field, value }) => {
  const result = searchData({ data, field, value });
  if (!result || result.length === 0) {
    console.log("Result not found!");
    requestQuestion();
    return;
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
      : typeData === "tickets"
      ? TICKETS
      : null;
  if (!data) {
    console.log("Not found: 404");
    requestQuestion();
    return;
  }
  switch (action) {
    case ACTION.describe:
      PrintDescribe(data);
      break;
    case ACTION.table:
      handleTableTypeData({ data, field, value, typeData });
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
