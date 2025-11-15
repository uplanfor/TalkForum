import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    id: number;
    email: string;
    name: string;
    role : string;
    avatarLink: string;
    backgroudLink: string;
    isLoggedIn: boolean;
}

const initialState: UserState = {
    id: 0,
    email: 'please@login.com',
    name: 'Unknown',
    role: 'USER',
    avatarLink: '1',
    backgroudLink: 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t',
    isLoggedIn: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userLogin: (state, action: PayloadAction<UserState>) => {
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.avatarLink = action.payload.avatarLink;
            state.backgroudLink = action.payload.backgroudLink;
            state.isLoggedIn = true;
        },
        userLogout: (state) => {
            state = {...initialState };
        }
        ,
    },
});


export const { userLogin, userLogout } = userSlice.actions;

export default userSlice.reducer;