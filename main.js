var fs = require("fs");
const readline = require("readline");
const ORGANIZATIONS = require("./data/organizations.json");
const TICKETS = require("./data/tickets.json");
const USERS = require("./data/users.json");
const { ACTION, ACTION_USER, TYPE_DATA } = require("./constants");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleGenerateArrByKey = (
  arr = [],
  keyCompare,
  valueCompare,
  keyReturn
) => {
  if (!arr || !arr.length) return [];
  return arr
    .filter((item) => item[keyCompare] === valueCompare)
    .map((ele) => ele[keyReturn]);
};

const getInfoOrganization = ({ result = [] }) => {
  return result.map(
    ({ _id, name, details, created_at, domain_names, tags }) => {
      const organizationId = _id;
      const resultUsers = handleGenerateArrByKey(
        USERS,
        "organization_id",
        organizationId,
        "name"
      );
      const resultTickets = handleGenerateArrByKey(
        TICKETS,
        "organization_id",
        organizationId,
        "subject"
      );
      return {
        id: _id,
        name: name,
        details: details,
        created_at: created_at,
        domain_names: domain_names.map((i) => i).join(","),
        tags: tags.map((i) => i).join(","),
        users: resultUsers.map((i) => i).join(","),
        tickets: resultTickets.map((i) => i).join(","),
      };
    }
  );
};

const getInfoUsers = ({ result = [] }) => {
  return result.map((item) => {
    const resultOrganization = handleGenerateArrByKey(
      ORGANIZATIONS,
      "_id",
      item.organization_id,
      "name"
    );
    const resultAssignedTickets = handleGenerateArrByKey(
      TICKETS,
      "assignee_id",
      item._id,
      "subject"
    );

    const resultSubmittedTickets = handleGenerateArrByKey(
      TICKETS,
      "submitter_id",
      item._id,
      "subject"
    );

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
    const resultAssignedTickets = handleGenerateArrByKey(
      TICKETS,
      "_id",
      ticket.assignee_id,
      "name"
    );

    const resultSubmittedTickets = handleGenerateArrByKey(
      USERS,
      "_id",
      ticket.submitter_id,
      "name"
    );

    const resultOrganization = handleGenerateArrByKey(
      ORGANIZATIONS,
      "_id",
      ticket.organization_id,
      "name"
    );
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
  if (!result || !result.length) {
    console.log("Result not found!");
    requestQuestion();
    return;
  }

  let resultForEveryCase = {};

  switch (typeData) {
    case TYPE_DATA.ORGANIZATIONS:
      resultForEveryCase = getInfoOrganization({ result });
      PrintTable(resultForEveryCase);
      break;
    case TYPE_DATA.USERS:
      resultForEveryCase = getInfoUsers({ result });
      PrintTable(resultForEveryCase);
      break;
    case TYPE_DATA.TICKETS:
      resultForEveryCase = getInfoTickets({ result });
      PrintTable(resultForEveryCase);
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
  if (!result || !result.length) {
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
    typeData === TYPE_DATA.ORGANIZATIONS
      ? ORGANIZATIONS
      : typeData === TYPE_DATA.USERS
      ? USERS
      : typeData === TYPE_DATA.TICKETS
      ? TICKETS
      : null;

  if (!data) {
    console.log("Not found: 404");
    requestQuestion();
    return;
  }

  switch (action) {
    case ACTION.DESCRIBE:
      PrintDescribe(data);
      break;
    case ACTION.TABLE:
      handleTableTypeData({ data, field, value, typeData });
      break;
    case ACTION.SEARCH:
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
    if (input === ACTION_USER.QUIT) {
      rl.close();
      return;
    }
    if (input === ACTION_USER.HELP) {
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
