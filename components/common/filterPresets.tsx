"use client"

import dayjs from 'dayjs';

export interface PresetDefinition {
    label: string;
    start_date: (() => string) | null;
    end_date: (() => string) | null;
}

export type PresetKey = 'today' | 'yesterday' | 'this_week' | 'last_week' |
    'this_month' | 'last_month' | 'last_3_months' | 'first_half' |
    'second_half' | 'q1' | 'q2' | 'q3' | 'q4' | 'custom';

export type FilterPresets = Record<PresetKey, PresetDefinition>;

/**
 * Predefined date filter presets
 */
export const filterPresets: FilterPresets = {
    today: {
        label: 'Today',
        start_date: () => dayjs().format('YYYY-MM-DD'),
        end_date: () => dayjs().format('YYYY-MM-DD')
    },
    yesterday: {
        label: 'Yesterday',
        start_date: () => dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
        end_date: () => dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    },
    this_week: {
        label: 'This week',
        // Monday - Sunday of current week
        start_date: () => dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'), // Monday
        end_date: () => dayjs().startOf('week').add(7, 'day').format('YYYY-MM-DD')   // Sunday
    },
    last_week: {
        label: 'Last week',
        // Monday - Sunday of last week
        start_date: () => dayjs().subtract(1, 'week').startOf('week').add(1, 'day').format('YYYY-MM-DD'),
        end_date: () => dayjs().subtract(1, 'week').endOf('week').add(1, 'day').format('YYYY-MM-DD')
    },
    this_month: {
        label: 'This month',
        start_date: () => dayjs().startOf('month').format('YYYY-MM-DD'),
        end_date: () => dayjs().format('YYYY-MM-DD')
    },
    last_month: {
        label: 'Last month',
        start_date: () => dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        end_date: () => dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
    },
    last_3_months: {
        label: 'Last 3 months',
        start_date: () => dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
        end_date: () => dayjs().format('YYYY-MM-DD')
    },
    first_half: {
        label: '1st half',
        start_date: () => dayjs().month(0).startOf('month').format('YYYY-MM-DD'),
        end_date: () => dayjs().month(5).endOf('month').format('YYYY-MM-DD')
    },
    second_half: {
        label: '2nd half',
        start_date: () => dayjs().month(6).startOf('month').format('YYYY-MM-DD'),
        end_date: () => dayjs().month(11).endOf('month').format('YYYY-MM-DD')
    },
    q1: {
        label: 'Q1',
        start_date: () => dayjs().month(0).startOf('month').format('YYYY-MM-DD'),
        end_date: () => dayjs().month(2).endOf('month').format('YYYY-MM-DD')
    },
    q2: {
        label: 'Q2',
        start_date: () => dayjs().month(3).startOf('month').format('YYYY-MM-DD'),
        end_date: () => dayjs().month(5).endOf('month').format('YYYY-MM-DD')
    },
    q3: {
        label: 'Q3',
        start_date: () => dayjs().month(6).startOf('month').format('YYYY-MM-DD'),
        end_date: () => dayjs().month(8).endOf('month').format('YYYY-MM-DD')
    },
    q4: {
        label: 'Q4',
        start_date: () => dayjs().month(9).startOf('month').format('YYYY-MM-DD'),
        end_date: () => dayjs().month(11).endOf('month').format('YYYY-MM-DD')
    },
    custom: {
        label: 'Custom',
        start_date: null,
        end_date: null
    }
};