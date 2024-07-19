import { configureStore } from "@reduxjs/toolkit";
import Reducer from "./Reducers/Reducer";


export const store = configureStore({
    reducer: {
        shop: Reducer,
    }
})