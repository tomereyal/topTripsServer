const SERVER_BASE_URL = process.env.PUBLIC_URL || `http://localhost:4000/api`;
console.log(`SERVER_BASE_URL`, SERVER_BASE_URL);
export const usersServerEndpoint = `${SERVER_BASE_URL}/users`;
export const vacationsServerEndpoint = `${SERVER_BASE_URL}/vacations`;
export const uploadsServerEndpoint = `${SERVER_BASE_URL}/uploads`;
