declare module 'expo-sqlite' {
  export interface SQLiteRunResult {
    lastInsertRowId: number;
    changes: number;
  }

  export interface SQLiteDatabase {
    execAsync(source: string): Promise<void>;
    runAsync(
      source: string,
      ...params: Array<string | number | null | Uint8Array>
    ): Promise<SQLiteRunResult>;
    getFirstAsync<T>(
      source: string,
      ...params: Array<string | number | null | Uint8Array>
    ): Promise<T | null>;
    getAllAsync<T>(
      source: string,
      ...params: Array<string | number | null | Uint8Array>
    ): Promise<T[]>;
    withTransactionAsync(task: () => Promise<void>): Promise<void>;
  }

  export function openDatabaseAsync(
    databaseName: string
  ): Promise<SQLiteDatabase>;
}

declare module 'expo-notifications' {
  export enum AndroidImportance {
    UNKNOWN = 0,
    UNSPECIFIED = 1,
    NONE = 1,
    MIN = 2,
    LOW = 3,
    DEFAULT = 4,
    HIGH = 5,
    MAX = 6,
  }

  export enum SchedulableTriggerInputTypes {
    DATE = 'date',
    TIME_INTERVAL = 'timeInterval',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
    CALENDAR = 'calendar',
  }

  export interface NotificationContentInput {
    title?: string | null;
    subtitle?: string | null;
    body?: string | null;
    data?: Record<string, unknown>;
    sound?: boolean | string;
    vibrate?: number[];
    color?: string;
    priority?: string;
  }

  export interface DateTriggerInput {
    type: SchedulableTriggerInputTypes.DATE;
    date: Date | number;
    channelId?: string;
  }

  export interface NotificationRequestInput {
    identifier?: string;
    content: NotificationContentInput;
    trigger: DateTriggerInput | null;
  }

  export interface ScheduledNotificationRequest {
    identifier: string;
    content: {
      title?: string | null;
      body?: string | null;
      data?: Record<string, unknown>;
    };
  }

  export interface NotificationPermissionsStatus {
    status: 'granted' | 'denied' | 'undetermined';
    granted: boolean;
    canAskAgain: boolean;
  }

  export function setNotificationHandler(handler: {
    handleNotification: () => Promise<{
      shouldShowAlert?: boolean;
      shouldShowBanner?: boolean;
      shouldShowList?: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }): void;

  export function setNotificationChannelAsync(
    channelId: string,
    channel: {
      name: string;
      importance: AndroidImportance;
      vibrationPattern?: number[];
      lightColor?: string;
      sound?: string | null;
      enableVibrate?: boolean;
    }
  ): Promise<unknown>;

  export function getPermissionsAsync(): Promise<NotificationPermissionsStatus>;

  export function requestPermissionsAsync(permissions?: {
    ios?: {
      allowAlert?: boolean;
      allowBadge?: boolean;
      allowSound?: boolean;
    };
    android?: Record<string, unknown>;
  }): Promise<NotificationPermissionsStatus>;

  export function scheduleNotificationAsync(
    request: NotificationRequestInput
  ): Promise<string>;

  export function cancelScheduledNotificationAsync(
    identifier: string
  ): Promise<void>;

  export function cancelAllScheduledNotificationsAsync(): Promise<void>;

  export function getAllScheduledNotificationsAsync(): Promise<
    ScheduledNotificationRequest[]
  >;
}
