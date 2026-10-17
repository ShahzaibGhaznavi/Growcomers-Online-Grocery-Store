import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { NODE_API, PRIVATE_PYTHON_API } from "../../api/apiIndex";

const initialState = {
  data: null,
  rateStatus: "idle",
  rateError: "",
  trainStatus: "idle",
  trainError: "",
  trainData: null,
};

export const fetchINRvalue = createAsyncThunk(
  "dai/fetchINRvalue",
  async (_, { rejectWithValue }) => {
    try {
      const response = await NODE_API.get("/rate/dai-inr", {
        timeout: 10000,
      });

      const rate = Number(response.data?.INR);

      if (!Number.isFinite(rate) || rate <= 0) {
        return rejectWithValue("Invalid DAI exchange rate received");
      }

      return rate;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch the DAI exchange rate"
      );
    }
  }
);

export const trainCFModel = createAsyncThunk(
  "dai/trainCFModel",
  async (data, { rejectWithValue }) => {
    try {
      const response = await PRIVATE_PYTHON_API.post("/train", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Model training failed"
      );
    }
  }
);

const daiSlice = createSlice({
  name: "dai",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchINRvalue.pending, (state) => {
        state.rateStatus = "loading";
        state.rateError = "";
      })
      .addCase(fetchINRvalue.fulfilled, (state, action) => {
        state.data = action.payload;
        state.rateStatus = "success";
        state.rateError = "";
      })
      .addCase(fetchINRvalue.rejected, (state, action) => {
        state.data = null;
        state.rateStatus = "failed";
        state.rateError =
          action.payload || "Unable to fetch the DAI exchange rate";
      })
      .addCase(trainCFModel.pending, (state) => {
        state.trainStatus = "loading";
        state.trainError = "";
      })
      .addCase(trainCFModel.fulfilled, (state, action) => {
        state.trainStatus = "success";
        state.trainError = "";
        state.trainData = action.payload.data;
      })
      .addCase(trainCFModel.rejected, (state, action) => {
        state.trainStatus = "failed";
        state.trainError =
          action.payload || "Model training failed";
      });
  },
});

export const getINRvalue = (state) => state.dai.data;
export const getRateStatus = (state) => state.dai.rateStatus;
export const getRateError = (state) => state.dai.rateError;
export const getTrainingSummary = (state) => state.dai.trainData;
export const getTrainingStatus = (state) => state.dai.trainStatus;
export const getTrainingError = (state) => state.dai.trainError;

export default daiSlice.reducer;