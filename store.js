import { configureStore } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});