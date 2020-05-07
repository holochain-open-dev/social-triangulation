import {
  HolochainProvider,
  HolochainConnectionModule,
  HolochainConnection,
} from '@uprtcl/holochain-provider';

import { SocialTriangulationBindings } from '../bindings';

export const resolvers = {
  Mutation: {
    async vouchForAgent(_, { agentId }, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationProvider
      );

      await socialTriangulationProvider.call('vouch_for', {
        agent_address: agentId,
      });
      return true;
    },
    async joinNetwork(_, { agentId }, { container }) {
      const connection: HolochainConnection = container.get(
        HolochainConnectionModule.bindings.HolochainConnection
      );
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationProvider
      );

      // const result = await connection.callAdmin('admin/instance/add', {id: 'mutual-credit-instance', agent_id: agentId, });

      const remoteBridgeProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.RemoteBridgeProvier
      );

      await remoteBridgeProvider.call('volunteer_to_bridge', {
        dna_handle: socialTriangulationProvider.instance,
      });

      return true;
    },
  },
  Query: {
    async minVouches(_, __, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationProvider
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
        SocialTriangulationBindings.SocialTriangulationProvider
      );

      const settings: string = await socialTriangulationProvider.call(
        'get_setting',
        {}
      );

      return settings.includes(parent.id);
    },
    async vouchesCount(parent, _, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationProvider
      );

      try {
        const numVouches = await socialTriangulationProvider.call(
          'vouch_count_for',
          {
            agent_address: parent.id,
          }
        );
        return parseInt(numVouches);
      } catch (e) {
        if (instanceNotValid(e)) {
          const remoteBridgeProvider: HolochainProvider = container.get(
            SocialTriangulationBindings.RemoteBridgeProvier
          );

          const result = await remoteBridgeProvider.call(
            'request_remote_bridge',
            {
              dna_handle: socialTriangulationProvider.instance,
              zome_name: 'social-triangulation',
              cap_token: null,
              fn_name: 'vouch_count_for',
              fn_args: JSON.stringify({ agent_address: parent.id }),
            }
          );
          debugger;
          return parseInt(result);
        } else throw new Error(e);
      }
    },
  },
};

export function instanceNotValid(error: Error): boolean {
  return error.message.includes(
    'instance identifier invalid: PublicInstanceIdentifier'
  );
}
