import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlide';
import userReducer from './slice/userSlide';
import permissionReducer from './slice/permissionSlide';
import roleReducer from './slice/roleSlide';
import homestayReducer from './slice/homestaySlide';
import bookingReducer from './slice/bookingSlide';
import transactionReducer from './slice/transactionSlide';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    user: userReducer,
    booking: bookingReducer,
    permission: permissionReducer,
    role: roleReducer,
    homestay: homestayReducer,
    transaction: transactionReducer,
  },
});


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;