import { HolochainProvider } from '@uprtcl/holochain-provider';

import { SocialTriangulationBindings } from '../bindings';

export const resolvers = {
  Mutation: {
    async vouchForAgent(_, { agentId }, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationBindings
      );

      return socialTriangulationProvider.call('vouch_for_agent', { agentId });
    },
  },
  Query: {
    async minVouches(_, __, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationBindings
      );

      const settings: string = await socialTriangulationProvider.call(
        'get_setting',
        {}
      );

      return settings.split('Minimum_Required_Vouch:')[1];
    },
  },
  Agent: {
    async isInitialMember(parent, _, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationBindings
      );

      const settings: string = await socialTriangulationProvider.call(
        'get_setting',
        {}
      );

      const initialMembers = settings.split('Admin_Members:')[0];
      return initialMembers.includes(parent);
    },
    async numVouches(parent, _, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationBindings
      );

      const numVouches = await socialTriangulationProvider.call(
        'vouch_count_for',
        {
          agent_address: parent,
        }
      );

      return parseInt(numVouches);
    },
  },
};
