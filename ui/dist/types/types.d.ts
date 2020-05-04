import { Agent } from 'holochain-profiles';
export interface VouchedAgent extends Agent {
    vouchesCount: number;
    isInitialMember: boolean;
}
