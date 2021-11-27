import { VacationModel } from "./models/vaca.model";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import expressJwt from "express-jwt";
import cookieParser from "cookie-parser";
import { userRouter } from "./routers/users.router";
import { vacationRouter } from "./routers/vaca.router";
import errorMiddleware from "./middleware/error.middleware";
import { config } from "dotenv";
import { uploadRouter } from "./routers/uploads.router";
import { Socket } from "socket.io";

const corsOptions = {
  origin: true, //included origin as true
  credentials: true, //included credentials as true
};

config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 4000;

const { JWT_SECRET = "secret" } = process.env;

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//===================
//   expressJwt()  "The first gate against unauthorized clients"
//===================
// comment out this line if you want to bypass JWT check during development
// When client attaches "bearer token" , expressJwt verifies it and if it is authenticated it will
// additionally make the tokens claims (whatever I configured them to be) available under user property of req=> req.user
app.use(express.static("uploads"));
if (process.env.NODE_ENV === "production") {
  //e.g. Heroku is running our app
  // app.use(express.static("client/build"));
  app.use(express.static(path.join(path.resolve("./"), "/client/build")));

  console.log(`I AM IN PRODUCTION`);
}
// app.use(express.static("client/build"));

// console.log(`I AM IN PRODUCTION`);
// console.log(`process.env.NODE_ENV`, process.env.NODE_ENV);
app.use(
  "/api",
  expressJwt({ secret: JWT_SECRET }).unless({
    path: [
      "/api/users/register",
      "/api/users/login",
      "/api/users/logout",
      "/api/users/auth",
      "/api/users/isUsernameTaken",
    ],
  })
);

app.use("/api/users", userRouter);
app.use("/api/vacations", vacationRouter);
app.use("/api/uploads", uploadRouter);

app.get("/*", (req, res) => {
  const rootDirectory = path.resolve("./");
  // res.sendFile(path.join(rootDirectory, "client/build", "index.html"));
  res.status(200).json({ message: "welcome" });
});

const ClientListener = {
  connected: "connected",
  updateVacations: "updateVacations",
  follow: "follow",
  unfollow: "unfollow",
  remove: "remove",
  replace: "replace",
  joinRoom: "joinRoom",
};

const ClientEvent = ClientListener;

const server = http.createServer(app);
const io = require("socket.io")(server) as Socket;
io.on("connection", (client: Socket) => {
  console.log(`SOCKET CREATED`);
  client.emit(ClientListener.connected, {
    message: "Hello client I, the web socket server, and you are connected",
  });
  /* Listens to socket emit events sent by client -after- HTTP client server mutations have taken place
   the data recieved here depends on the socket emit functions written by the CLIENT!*/

  //Listening to update of vacation => if I heard the event, I will send ALL clients the updated vacation
  //Listening to addition of vacation => if I heard the event, I will send ALL clients the new vacation
  //Listening to removal of vacation => if I heard the event, I will send ALL clients the remaining vacations
  //Listening to new vacation follow => if I heard the event, I will send ALL clients the current follow count
  //Listening to new vacation unfollow => if I heard the event, I will send ALL clients the current follow count
  client.on(ClientEvent.joinRoom, (vacationIds) => {
    console.log(`This client follows the following vacations:`, vacationIds);
    vacationIds.forEach((id: number) => client.join("vacation:" + id));
  });

  client.on(ClientEvent.follow, (vacaId: number, callback) => {
    console.log(vacaId);
    client.to(`vacation:${vacaId}`).emit(ClientListener.follow, { vacaId });
    client.join("vacation:" + vacaId);
  });
  client.on(ClientEvent.unfollow, (vacaId: number, callback) => {
    console.log(vacaId);
    client.to(`vacation:${vacaId}`).emit(ClientListener.unfollow, { vacaId });
    client.leave("vacation:" + vacaId);
  });
  client.on(ClientEvent.remove, (vacaId: number, callback) => {
    console.log(vacaId);
    client.to(`vacation:${vacaId}`).emit(ClientListener.remove, { vacaId });
  });
  client.on(ClientEvent.replace, (updatedVacation: VacationModel) => {
    console.log(
      `sending to all subscriped clients the new vacation:`,
      updatedVacation
    );
    client.to(`vacation:${updatedVacation.id}`).emit(ClientListener.replace, {
      vacaId: updatedVacation.id,
      updatedVacation,
    });
  });
});

server.listen(PORT, () => console.log(`Server is up at ${PORT}`));

app.use(errorMiddleware);

//under the hood what expressJwt does=>
