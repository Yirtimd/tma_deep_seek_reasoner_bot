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
    case 'UPDATE_LAST_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg, index) =>
          index === state.messages.length - 1
            ? { ...msg, text: action.payload.text } // Обновляем текст последнего сообщения
            : msg
        ),
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