import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {AccountResponse} from '@/types';

interface AccountState {
    accounts: AccountResponse[];
    selectedAccount: AccountResponse | null;
    setAccounts: (accounts: AccountResponse[]) => void;
    setSelectedAccount: (account: AccountResponse | null) => void;
    clearAccounts: () => void;
}

export const useAccountStore = create<AccountState>()(
    persist(
        (set) => ({
            accounts: [],
            selectedAccount: null,

            setAccounts: (accounts) =>
                set({accounts}),

            setSelectedAccount: (account) =>
                set({selectedAccount: account}),

            clearAccounts: () =>
                set({accounts: [], selectedAccount: null}),
        }),
        {
            name: 'ebenezer-account',
            // Only persist selectedAccount, not the full list
            // The list is always fetched fresh from the server
            partialize: (s) => ({
                selectedAccount: s.selectedAccount,
            }),
        }
    )
);