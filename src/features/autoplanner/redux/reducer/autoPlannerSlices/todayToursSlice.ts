import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../../../../app/config/axiosInstance';
import URLs from '../../../../../utils/appURLs';

const initialState: InitialStateTypes = {
  data: [],
  isLoading: false,
  error: '',
  count: 0,
  statusCount: {}
};

interface InitialStateTypes {
  [key: string]: any;
}

//action for get today tours
export const getTodayTours = createAsyncThunk<any, any>(
  'todaytours',
  async (data, thunkApi) => {
    const { PageNo, PageSize, autoplannerID, searchFor } = data;

    let URL = `${URLs.GET_TODAY_TOURS}pageNo=${PageNo}&pageSize=${PageSize}&autoplannerId=${autoplannerID}`;

    if (searchFor) {
      URL += `&searchFor=${searchFor}`;
    }
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: URL
      });

      return response;
    } catch (err: any) {
      return thunkApi.rejectWithValue(err);
    }
  }
);

//reducer for get today tours
const getTodayToursSlice = createSlice({
  name: 'todayTours',
  initialState,
  reducers: {
    clearTodayTour: state => {
      state.data = [];
      state.statusCount = {};
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getTodayTours.pending, (state, action) => {
        state.isLoading = true;
        // state.data = [];
      })
      .addCase(getTodayTours.fulfilled, (state, action: any) => {
        state.isLoading = false;

        const {
          data: {
            data: {
              tripsInfo,
              count,
              tripStatusAggregateSum,
              guestsInfo,
              bookingsOnboardedMap
            }
          }
        } = action.payload;
        const {
          Upcoming,
          Intransit,
          Completed,
          Skipped: tripSkipped
        } = tripStatusAggregateSum;
        const { guestTotalAggregate, arrivedTotalAggregate, absentTotalAggregate } =
          guestsInfo;

        const {
          Onboarded = 0,
          Pending = 0,
          No_show = 0,
          Skipped = 0
        } = bookingsOnboardedMap;
        state.statusCount = {
          Upcoming: Upcoming,
          'In-transit': Intransit,
          Completed: Completed,
          Onboarded: Onboarded ?? 0,
          'Trip Skipped': tripSkipped,
          'Yet to onboard': Pending,
          Skipped: Skipped,
          'No show': No_show,
          Total: Onboarded + Pending + No_show + Skipped
        };
        state.count = count;
        state.data = tripsInfo?.map((item: any) => ({
          ...item,
          color: [null, 'Upcoming']?.includes(item.status)
            ? '#fff'
            : item?.status === 'Completed'
            ? '#d6ffce'
            : item?.status === 'Skipped'
            ? '#D9D3D0'
            : '#fff1bb'
        }));
      })
      .addCase(getTodayTours.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.error?.message;
      });
  }
});

export const getTodayToursData = getTodayToursSlice.reducer;
export const { clearTodayTour } = getTodayToursSlice.actions;
