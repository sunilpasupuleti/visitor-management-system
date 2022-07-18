import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchTheme = createAsyncThunk('service/fetchTheme', async () => {
  try {
    const result = await AsyncStorage.getItem(`@vms-theme`).then(d => {
      return JSON.parse(d);
    });

    if (result) {
      return result;
    }
    return false;
  } catch (e) {
    console.log('error in fetching changesmade - ', e);
    return false;
  }
});

export const setTheme = createAsyncThunk(
  'service/setTheme',
  async ({theme}) => {
    await AsyncStorage.setItem(`@vms-theme`, JSON.stringify(theme));
    return theme;
  },
);

const serviceSlice = createSlice({
  name: 'service',
  initialState: {
    theme: 'automatic',
    exchangeRates: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchTheme.fulfilled, (state, action) => {
      if (action.payload) {
        state.theme = action.payload;
      }
    });

    builder.addCase(setTheme.fulfilled, (state, action) => {
      state.theme = action.payload;
    });
  },
});

export const serviceActions = serviceSlice.actions;
export default serviceSlice;
