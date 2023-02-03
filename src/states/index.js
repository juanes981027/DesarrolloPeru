import { combineReducers } from 'redux';

import { reduce as CustomTaskListReducer } from './CustomTaskListState';

import { reduce as queueSummaryReducer } from './QueueSummaryState';
import { reduce as workerListReducer } from './WorkerListState';

// Register your redux store under a unique namespace
export const namespace = 'DigitalHiring';

// Combine the reducers
export default combineReducers({

  customTaskList: CustomTaskListReducer,
  queueSummary: queueSummaryReducer,
  workerList: workerListReducer,

  customTaskList: CustomTaskListReducer
});
