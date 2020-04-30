import { HolochainProvider } from '@uprtcl/holochain-provider';

import { ProfilesBindings } from '../bindings';

export const resolvers = {
  Query: {
    async allAgents(_, __, { container }) {
      const profilesProvider: HolochainProvider = container.get(
        ProfilesBindings.ProfilesProvider
      );

      const allAgents = await profilesProvider.call('get_all_agents', {});
      return allAgents.map((agent) => ({
        id: agent.agent_id,
        username: agent.username,
      }));
    },
    async me(_, __, { container }) {
      const profilesProvider: HolochainProvider = container.get(
        ProfilesBindings.ProfilesProvider
      );

      return profilesProvider.call('get_my_address', {});
    },
  },
  Agent: {
    id(parent) {
      return parent;
    },
    username(parent, _, { container }) {
      const profilesProvider: HolochainProvider = container.get(
        ProfilesBindings.ProfilesProvider
      );

      return profilesProvider.call('get_username', { agent_address: parent });
    },
  },
  Mutation: {
    async setUsername(_, { username }, { container }) {
      const profilesProvider: HolochainProvider = container.get(
        ProfilesBindings.ProfilesProvider
      );

      return profilesProvider.call('set_username', { username });
    },
  },
};
