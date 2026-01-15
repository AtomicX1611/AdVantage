import {createSlice} from '@reduxjs/toolkit'

const initialState = {
  user: null,      
  isAuth: false,   
  error: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      console.log("Action payload : ",action);
      //After login , this will be called user will be set
      state.loading = false;
      state.isAuth = true;
      state.user = action.payload; 
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuth = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuth = false;
      state.loading = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
