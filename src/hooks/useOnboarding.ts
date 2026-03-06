import { useEffect, useState } from 'react';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'oneyear-onboarding' });
const TUTORIAL_DONE_KEY = '@oneyear_tutorial_done';

/**
 * Returns whether to show the first-time tutorial.
 * Once completeTutorial() is called (via Skip or Get Started),
 * the flag is persisted and the tutorial never shows again.
 */
export const useOnboarding = () => {
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const done = storage.getString(TUTORIAL_DONE_KEY);
        if (done !== 'true') {
            setShowTutorial(true);
        }
    }, []);

    const completeTutorial = () => {
        storage.set(TUTORIAL_DONE_KEY, 'true');
        setShowTutorial(false);
    };

    return { showTutorial, completeTutorial };
};
