/**
 * NotificationService.ts
 *
 * Manages daily progress notifications using @notifee/react-native.
 * Permissions are requested on first opt-in, then a repeating daily
 * notification is scheduled via a local trigger.
 */

import notifee, {
    AndroidImportance,
    RepeatFrequency,
    TimestampTrigger,
    TriggerType,
    AuthorizationStatus,
} from '@notifee/react-native';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'oneyear-notifications' });

const CHANNEL_ID = 'oneyear_daily';
const NOTIF_ENABLED_KEY = 'notif_enabled';
const NOTIF_HOUR_KEY = 'notif_hour';
const NOTIF_MINUTE_KEY = 'notif_minute';

const MOTIVATIONAL_MESSAGES = [
    'Time is the most valuable thing a person can spend. ⏳',
    'Make each day count. You\'ve only got {left} days left in {year}.',
    '{pct}% of {year} is gone. What will you do with the rest?',
    'Every day is a chance to change your life.',
    'Day {day} of {total}. Keep going! 💪',
    '{left} days remain in {year}. Make them epic! 🚀',
    'You are {pct}% through {year}. How\'s it going?',
    'Life is short. {pct}% of {year} already behind you!',
];

/* ─── Helpers ─── */

const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const getProgressForToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 0);
    const diff = now.getTime() - start.getTime() + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
    const dayIndex = Math.floor(diff / 86400000);
    const total = isLeapYear(year) ? 366 : 365;
    const pct = ((dayIndex / total) * 100).toFixed(1);
    const left = total - dayIndex;
    return { day: dayIndex, total, pct, left, year };
};

const buildMessage = (): string => {
    const { day, total, pct, left, year } = getProgressForToday();
    const template = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    return template
        .replace('{day}', String(day))
        .replace('{total}', String(total))
        .replace('{pct}', String(pct))
        .replace('{left}', String(left))
        .replace(/{year}/g, String(year));
};

/* ─── Channel ─── */

const createChannel = async () => {
    await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Daily Progress',
        importance: AndroidImportance.DEFAULT,
        sound: 'default',
    });
};

/* ─── Permission ─── */

export const requestNotifPermission = async (): Promise<boolean> => {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};

/* ─── Schedule ─── */

export const scheduleDailyNotification = async (hour = 9, minute = 0): Promise<void> => {
    await createChannel();

    // Cancel any existing trigger
    const existing = await notifee.getTriggerNotifications();
    for (const n of existing) {
        if (n.notification.android?.channelId === CHANNEL_ID) {
            await notifee.cancelTriggerNotification(n.notification.id!);
        }
    }

    // Build the first trigger time (today if not passed, otherwise tomorrow)
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(hour, minute, 0, 0);
    if (triggerDate.getTime() <= now.getTime()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
        {
            title: '⏳ OneYear Progress',
            body: buildMessage(),
            android: {
                channelId: CHANNEL_ID,
                smallIcon: 'ic_launcher',
                pressAction: { id: 'default' },
            },
            ios: {
                sound: 'default',
            },
        },
        trigger,
    );

    // Persist settings
    storage.set(NOTIF_ENABLED_KEY, true);
    storage.set(NOTIF_HOUR_KEY, hour);
    storage.set(NOTIF_MINUTE_KEY, minute);
};

/* ─── Cancel ─── */

export const cancelDailyNotification = async (): Promise<void> => {
    const existing = await notifee.getTriggerNotifications();
    for (const n of existing) {
        if (n.notification.android?.channelId === CHANNEL_ID) {
            await notifee.cancelTriggerNotification(n.notification.id!);
        }
    }
    storage.set(NOTIF_ENABLED_KEY, false);
};

/* ─── Getters ─── */

export const isNotifEnabled = (): boolean => storage.getBoolean(NOTIF_ENABLED_KEY) ?? false;
export const getNotifHour = (): number => storage.getNumber(NOTIF_HOUR_KEY) ?? 9;
export const getNotifMinute = (): number => storage.getNumber(NOTIF_MINUTE_KEY) ?? 0;
