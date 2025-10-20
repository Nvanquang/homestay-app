import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentNotification } from '@/contexts/WebSocketContext';

interface NotificationState {
  paymentNotifications: PaymentNotification[];
}

const initialState: NotificationState = {
  paymentNotifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addPaymentNotification: (state, action: PayloadAction<PaymentNotification>) => {
      state.paymentNotifications.push(action.payload);
    },
    clearPaymentNotifications: (state) => {
      state.paymentNotifications = [];
    }
  }
});

export const {
  addPaymentNotification,
  clearPaymentNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
