import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccountResponse } from '@/types';

interface AccountState {
    accounts: AccountResponse[];
    selectedAccount: AccountResponse | null;
    setAccounts: (accounts: AccountResponse[]) => void;
    setSelectedAccount: (account: AccountResponse | null) => void;
}

export const useAccountStore = create<AccountState>()(
    persist(
        (set) => ({
            accounts: [],
            selectedAccount: null,
            setAccounts: (accounts) => set({ accounts }),
            setSelectedAccount: (account) =>
                set({ selectedAccount: account }),
        }),
        { name: 'ebenezer-account' }
    )
);