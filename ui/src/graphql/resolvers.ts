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
};
