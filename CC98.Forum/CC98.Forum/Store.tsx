﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'
import error, { ErrorStore } from './Reducers/Error';
import post, { TopicState } from './Reducers/Post';
import userInfo, { UserInfoStore } from './Reducers/UserInfo';
import { Actions as UserCenterActions } from './Actions/UserCenter';
import { getReturnOfExpression, getType } from 'react-redux-typescript';

/**
 * 全局store的类型定义
 */
export interface RootState {
    error: ErrorStore;
    post: TopicState;
    userInfo: UserInfoStore;
}

function values<T>(o: { [s: string]: T }): T[] {
    return Object.keys(o).map(key => o[key]);
};

const Actions = { ...UserCenterActions };
const returnOfActions = values(Actions).map(getReturnOfExpression);
const returnOgActionsType = values(Actions).map(getType);

/**
 * 全部actiontype的类型定义
 */
export type RootActionType = typeof returnOgActionsType[number];

/**
 * 全部action的类型定义
 */
export type RootAction = typeof returnOfActions[number];

/**
 * 合并reducer
 */
const reducer = combineReducers<RootState>({
    error,
    post,
    userInfo
});

/**
 * 记录Action与Store
 * @param store
 */
const logger = store => next => action => {
    console.log(action.type);
    let result = next(action);
    console.log(store.getState());
    return result;
}

/**
 * 连接到redux开发者工具
 */
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(reducer, composeEnhancers(applyMiddleware(thunk, logger)));