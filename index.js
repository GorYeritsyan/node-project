const http = require("http");
const { readFileAsync } = require("./helpers/readFileAsync");

const server = http.createServer(async (req, res) => {
  // Homepage
  if (req.url === "/" && req.method === "GET") {
    readFileAsync("pages", "index.html").then((data) => {
      res.write(data);
      res.end();
    });
  } else if (req.url === "/api/users" && req.method === "GET") {
    // All Users
    readFileAsync("db", "users.json").then((data) => {
      res.write(data);
      res.end();
    });
  } else if (req.url.match(/\/api\/users\/([0-9]+)/) && req.method === "GET") {
    // One User
    const id = req.url.split("/").at(-1);

    readFileAsync("db", "users.json").then((data) => {
      const users = JSON.parse(data);

      const user = users.find((user) => user.id === +id);

      if (user) {
        res.write(JSON.stringify(user));
        res.end();
      } else {
        res.writeHead(404, { "content-type": "application/json" });
        res.end("{}");
      }
    });
  } else if (req.url.includes("?") && req.method === "GET") {
    // Get Filtered users by query params

    // all users
    const users = await readFileAsync("db", "users.json").then((users) =>
      JSON.parse(users)
    );

    // query params from url | [[key, value], [key2, value2]]
    const queryParams = req.url
      .split("?")
      .at(-1)
      .split("&")
      .map((params) => params.split("="));

    // init params obj
    const params = {
      name: null,
      age: null,
      sortBy: null,
      limit: null,
    };

    // Set params values
    queryParams
      .filter(([key]) => Object.keys(params).includes(key))
      .forEach(([key, value]) => {
        params[key] = value;
      });

    // filtered users init state
    let filteredUsers = [...users];

    // Filter by "name || age"
    if (params.name && params.age) {
      filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(params.name.toLowerCase()) &&
          user.age === +params.age
      );
    } else if (params.name) {
      filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(params.name.toLowerCase())
      );
    } else if (params.age) {
      filteredUsers = users.filter((user) => user.age === +params.age);
    }

    // Filter by "Sort by"
    if (params.sortBy && params.sortBy === "asc") {
      filteredUsers.sort((a, b) => a.age - b.age);
    } else if (params.sortBy && params.sortBy === "desc") {
      filteredUsers.sort((a, b) => b.age - a.age);
    }

    // Filter by "limit"
    if (params.limit) {
      filteredUsers = filteredUsers.slice(0, params.limit);
    }

    // Send Response
    res.writeHead(200, { "content-type": "application/json" });
    res.write(JSON.stringify(filteredUsers));
    res.end();
  } else {
    readFileAsync("pages", "error.html").then((data) => {
      res.writeHead(200, { "content-type": "text/html" });
      res.write(data);
      res.end();
    });
  }
});

server.listen(3000, () => {
  console.log(`Server is Running 3000 port`);
});
