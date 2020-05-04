import { HolochainProvider } from '@uprtcl/holochain-provider';

import { SocialTriangulationBindings } from '../bindings';

export const resolvers = {
  Mutation: {
    async vouchForAgent(_, { agentId }, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationBindings
      );

      await socialTriangulationProvider.call('vouch_for', {
        agent_address: agentId,
      });
      return true;
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

      return settings.includes(parent.id);
    },
    async vouchesCount(parent, _, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationBindings
      );

      const numVouches = await socialTriangulationProvider.call(
        'vouch_count_for',
        {
          agent_address: parent.id,
        }
      );

      return parseInt(numVouches);
    },
  },
};
