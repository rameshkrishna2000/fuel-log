import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducer/rootReducer';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'auth',
    'theme',
    'mapTheme',
    'myProfile',
    'RoleModuleAccess',
    'accessStatus',
    'otpDriverLogin'
  ]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
