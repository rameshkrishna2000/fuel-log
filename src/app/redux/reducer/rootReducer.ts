import { combineReducers } from 'redux';
import { autoPlannerReducer } from '../../../features/autoplanner/redux/reducer/autoPlannerReducer';
import { commonReducer } from '../../../common/redux/reducer/commonReducer';

const appReducer = combineReducers({
  ...commonReducer,
  ...autoPlannerReducer
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET') {
    state = {};
  }
  return appReducer(state, action);
};

export default rootReducer;
