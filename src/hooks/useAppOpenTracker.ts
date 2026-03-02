import { useEffect, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'oneyear-appopen' });

const OPEN_COUNT_KEY = '@oneyear_open_count';
const RATED_KEY = '@oneyear_rated';
const RATE_THRESHOLD = 4; // Show prompt after 4 opens

/**
 * Tracks app opens and determines whether to show the rate us prompt.
 */
export const useAppOpenTracker = () => {
    const [shouldShowRatePrompt, setShouldShowRatePrompt] = useState(false);

    useEffect(() => {
        const rated = storage.getString(RATED_KEY);
        if (rated === 'true') return; // Already rated, never show again

        const count = (storage.getNumber(OPEN_COUNT_KEY) ?? 0) + 1;
        storage.set(OPEN_COUNT_KEY, count);

        // Show on the RATE_THRESHOLD-th open and every 10 opens after that
        if (count === RATE_THRESHOLD || (count > RATE_THRESHOLD && count % 10 === 0)) {
            setShouldShowRatePrompt(true);
        }
    }, []);

    const markAsRated = () => {
        setShouldShowRatePrompt(false);
        storage.set(RATED_KEY, 'true');
    };

    const dismissPrompt = () => {
        setShouldShowRatePrompt(false);
    };

    return { shouldShowRatePrompt, markAsRated, dismissPrompt };
};
