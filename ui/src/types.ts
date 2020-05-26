import { Agent } from 'holochain-profiles';

export interface VouchedAgent extends Agent {
  vouchesCount: number;
  isInitialMember: boolean;
}

export interface SocialTriangulationOptions {
  instance: string;
  dnaId: string;
  templateDnaAddress: string;
  properties: {
    initial_members: Array<String>;
    necessary_vouches: number;
  };
}
