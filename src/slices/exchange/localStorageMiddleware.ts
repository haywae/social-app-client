import { type Middleware } from '@reduxjs/toolkit';
import { saveConverterRowsToStorage } from '../../utils/exchangeUtils';
import { type RootState } from '../../store'; // Adjust path to your store file if needed

/**
 * A Redux middleware that persists the converter's state to localStorage.
 * It listens for specific actions that modify the converter and, after the action
 * has been processed by the reducer, it saves the updated state.
 *
 * @param store - The Redux store instance.
 * @param next - A function that passes the action to the next middleware or the reducer.
 * @param action - The dispatched action object.
 */
export const localStorageMiddleware: Middleware = store => next => action => {
    // First, let the action pass through to the reducers so the state is updated.
    const result = next(action);

    // A hardcoded list of action types that should trigger a save to localStorage.
    const converterActions = [
        'exchange/setConverterMode',
        'exchange/setConverterRows',
        'exchange/addConverterRow',
        'exchange/recalculateConverter',
        'exchange/updateConverterValue',
        'exchange/updateConverterCurrency',
        'exchange/removeConverterRow',
        'exchange/resetConverterRow'
    ];

    // This is a type guard to safely check if `action` is a valid Redux action object.
    if (typeof action === 'object' && action !== null && 'type' in action && typeof (action as any).type === 'string') {
        // If the dispatched action's type is in our list...
        if (converterActions.includes((action as any).type)) {
            // ...get the latest state from the store and save it.
            const converterState = (store.getState() as RootState).exchange.converterState;
            saveConverterRowsToStorage('convert', converterState.convert);
            saveConverterRowsToStorage('findOut', converterState.findOut);
        }
    }
    
    return result;
};