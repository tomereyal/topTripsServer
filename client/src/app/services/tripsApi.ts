import { UserState } from "./../../features/user/userSlice";
import { VacationModel } from "./../../models/vacation.model";
import {
  createApi,
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { UserModel } from "../../models/user.model";
import {
  removeUserCredentials,
  setUserCredentials,
} from "../../features/user/userSlice";
import io, { Socket } from "socket.io-client";
import { SERVER_BASE_URL } from "../serverConfig";



export interface User {
  first_name: string;
  last_name: string;
}

export interface UserResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export type VacationFollowStat = {
  id: number;
  title: string;
  follows: number;
};

export type LoginParams = { username?: string; password?: string };

export type UserAuth = {
  accessToken: "string";
  accessTokenExpiration: number;
  userDetails: Omit<UserModel, "username" | "password">;
};


const ServerEvent = {
  connected: "connected",
  follow: "follow",
  unfollow: "unfollow",
  replace: "replace",
  remove: "remove",
  update: "update",
  joinRoom: "joinRoom",
};

const ServerListener = ServerEvent;

let socket: Socket;

const baseQuery = fetchBaseQuery({
  baseUrl: `${SERVER_BASE_URL}/`,
  prepareHeaders: (headers, { getState }) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const tokenState = (getState() as RootState).user.accessToken;
    const tokenLocalStr = localStorage.getItem("token");
    const token = tokenState.length > 0 ? tokenState : tokenLocalStr;
    console.log(`token`, token);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = await baseQuery("users/auth", api, extraOptions);
    if (refreshResult.data) {
      console.log(`BASE QUERY: retrieved data from req `, refreshResult.data);

      // store the new token
      let userAuth = refreshResult.data as UserState;
      console.log(`userAuth`, userAuth);
      api.dispatch(setUserCredentials(userAuth));
      // retry the initial query
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log(
        `BASE QUERY: unable to authorize from request because`,
        refreshResult.error
      );
      api.dispatch(removeUserCredentials());
    }
  }
  return result;
};

export const tripsApi = createApi({
  reducerPath: "tripsApi",
  baseQuery: baseQueryWithReauth,

  tagTypes: ["Vacation"],
  endpoints: (builder) => ({
    login: builder.mutation<UserAuth, LoginParams>({
      query: (credentials) => ({
        url: "users/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<boolean, number>({
      query: (userId) => ({
        url: "users/logout",
        method: "POST",
        body: { userId },
      }),
      async onCacheEntryAdded(arg, { getState, dispatch, getCacheEntry }) {
        if (getCacheEntry().data) return;
        dispatch(removeUserCredentials());
        dispatch(tripsApi.util.resetApiState());
      },
    }),
    register: builder.mutation<number, UserModel>({
      query: (user) => ({
        url: "users/register",
        method: "POST",
        body: user,
      }),
    }),
    isUsernameTaken: builder.mutation<{ isUsernameTaken: boolean }, string>({
      query: (username) => `users/isUsernameTaken?username=${username}`,
    }),
    protected: builder.mutation<{ message: string }, void>({
      query: () => "protected",
    }),

    getUsersVacations: builder.query<VacationModel[], void>({
      query: () => "vacations/followedByUser",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Vacation" as const, id }))]
          : ["Vacation"],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        /*1) Connect to the websocket created by your server when the cache subscription starts*/
        // const ws = new WebSocket("ws://localhost:4000");
        //I MOVED THE STEP ONE TO A GLOBAL SCOPE ABOVE THE TRIPAPI OBJECT

        socket = io("ws://localhost:4000", {
          transports: ["websocket", "polling"],
        });

        try {
          /*2) wait for the initial query to resolve before proceeding*/
          const result = await cacheDataLoaded;
          const vacationIds = result.data.map(({ id }) => id);
          /*3) When data is received from some client to the servers web socket,
           add the following handlers to WS that will track that info update vacations when */
          //user follows a vacation
          //user unfollows a vacation
          //admin adds a vacation
          //admin edits a vacation
          //admin removes a vacation
          const handleConnected = (event: { message: string }) => {
            console.log(
              `SERVER: "Another user has connected to the web socket 
               requesting these vacations :D" `,
              event.message
            );
            //once connected tell the server io which vacations you are currently following and subscribe to their rooms
            socket.emit(ServerListener.joinRoom, vacationIds);
          };
          const handleFollow = (event: { vacaId: number }) => {
            console.log(
              `SERVER: increase follow count for vaca # :`,
              event.vacaId
            );
            updateCachedData((draft: VacationModel[]) => {
              const i = draft.findIndex((v) => v.id === event.vacaId);
              //@ts-ignore
              if (draft && draft[i]) draft[i].follows = draft[i].follows + 1;
            });
          };
          const handleUnfollow = (event: { vacaId: number }) => {
            console.log(
              `SERVER: increase follow count for vaca # :`,
              event.vacaId
            );
            updateCachedData((draft: VacationModel[]) => {
              const i = draft.findIndex((v) => v.id === event.vacaId);
              //@ts-ignore
              if (draft[i] && draft[i].follows > 0)
                //@ts-ignore
                draft[i].follows = draft[i].follows - 1;
            });
          };

          const handleRemove = (event: { vacaId: number }) => {
            console.log(`SERVER: remove vacation # :`, event.vacaId);
            updateCachedData((draft: VacationModel[]) => {
              const i = draft.findIndex((v) => v.id === event.vacaId);
              draft.splice(i, 1);
            });
          };
          const handleReplace = (event: {
            vacaId: number;
            updatedVacation: VacationModel;
          }) => {
            console.log(`SERVER: replace vacation # :`, event.vacaId);
            console.log(`with this updated vacation`, event.updatedVacation);
            updateCachedData((draft: VacationModel[]) => {
              const i = draft.findIndex((v) => v.id === event.vacaId);
              draft[i] = event.updatedVacation;
            });
          };

          // ws.addEventListener("message", handleEdit);
          socket.on(ServerEvent.connected, handleConnected);
          socket.on(ServerEvent.follow, handleFollow);
          socket.on(ServerEvent.unfollow, handleUnfollow);
          socket.on(ServerEvent.remove, handleRemove);
          socket.on(ServerEvent.replace, handleReplace);
        } catch {}

        await cacheEntryRemoved;

        socket.close();
      },
    }),
    getCurrentVacations: builder.query<
      VacationModel[],
      { current: number; fetchSize: number }
    >({
      query: ({ current, fetchSize }) =>
        `vacations?current=${current}&fetchSize=${fetchSize}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Vacation" as const,
                id: id + "CRNT",
              })),
            ]
          : ["Vacation"],
    }),
    getTotalVacations: builder.query<number, void>({
      query: () => "vacations/total",
    }),
    getFollowStats: builder.query<VacationFollowStat[], void>({
      query: () => "vacations/vacationsFollowStats",
    }),
    createVacation: builder.mutation<number, Omit<VacationModel, "follows">>({
      query: (vacation) => ({
        url: "vacations/",
        method: "POST",
        body: vacation,
      }),
      invalidatesTags: () => ["Vacation"],
      //onCacheEntry => send the data to servers web socket so it can update all the other clients!
    }),
    updateVacation: builder.mutation<boolean, VacationModel>({
      query(vacation) {
        delete vacation.follows;
        return {
          url: "vacations/",
          method: "PATCH",
          body: vacation,
        };
      },
      invalidatesTags: () => ["Vacation"],
      async onCacheEntryAdded(arg) {
        socket.emit(ServerListener.replace, arg);
      },
    }),
    deleteVacation: builder.mutation<boolean, number>({
      query: (vacationId) => ({
        url: `vacations/${vacationId}`,
        method: "DELETE",
      }),
      invalidatesTags: () => ["Vacation"],
      async onCacheEntryAdded(arg, { cacheDataLoaded }) {
        try {
          await cacheDataLoaded;
          socket.emit(ServerListener.remove, arg);
        } catch {}
      },
    }),
    followVacation: builder.mutation<boolean, number>({
      query: (vacaId) => ({
        url: "users/followVacation",
        method: "POST",
        body: { vacaId },
      }),
      invalidatesTags: ["Vacation"],

      async onCacheEntryAdded(arg, { cacheDataLoaded }) {
        try {
          await cacheDataLoaded;
          socket.emit(ServerListener.follow, arg);
        } catch {}
      },
    }),
    unfollowVacation: builder.mutation<boolean, number>({
      query: (vacaId) => ({
        url: "users/unfollowVacation",
        method: "POST",
        body: { vacaId },
      }),
      invalidatesTags: ["Vacation"],
      async onCacheEntryAdded(arg, { cacheDataLoaded }) {
        try {
          await cacheDataLoaded;
          socket.emit(ServerListener.unfollow, arg);
        } catch {}
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useIsUsernameTakenMutation,
  useLoginMutation,
  useLogoutMutation,
  useProtectedMutation,
  useGetUsersVacationsQuery,
  useGetCurrentVacationsQuery,
  useGetTotalVacationsQuery,
  useGetFollowStatsQuery,
  useCreateVacationMutation,
  useUpdateVacationMutation,
  useDeleteVacationMutation,
  useFollowVacationMutation,
  useUnfollowVacationMutation,
} = tripsApi;
