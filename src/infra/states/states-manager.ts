// src/utils/state-manager.ts
type UserState = {
    dados: any;
};

const userStates: Record<string, UserState> = {};

export const getUserState = (userId: string) => userStates[userId] || { step: 0 };

export const setUserState = (userId: string, state: UserState) => {
    userStates[userId] = state;
};

export const resetUserState = (userId: string) => {
    delete userStates[userId];
};




