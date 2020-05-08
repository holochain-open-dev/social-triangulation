import {
  HolochainProvider,
  HolochainConnectionModule,
  HolochainConnection,
} from '@uprtcl/holochain-provider';

import { SocialTriangulationBindings } from '../bindings';
import { Container } from 'inversify';

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
      const settings: string = await localOrRemoteCall(
        container,
        'get_setting',
        {}
      );

      return settings.split('Minimum_Required_Vouch:')[1];
    },
  },
  Agent: {
    async isInitialMember(parent, _, { container }) {
      const settings: string = await localOrRemoteCall(
        container,
        'get_setting',
        {}
      );

      return settings.includes(parent.id);
    },
    async vouchesCount(parent, _, { container }) {
      const result = await localOrRemoteCall(container, 'vouch_count_for', {
        agent_address: parent.id,
      });

      return parseInt(result);
    },
  },
};

export function instanceNotValid(error: Error): boolean {
  return error.message.includes(
    'instance identifier invalid: PublicInstanceIdentifier'
  );
}

export function localOrRemoteCall(
  container: Container,
  fnName: string,
  fnArgs: any
): Promise<any> {
  const socialTriangulationProvider: HolochainProvider = container.get(
    SocialTriangulationBindings.SocialTriangulationProvider
  );

  try {
    return socialTriangulationProvider.call(fnName, fnArgs);
  } catch (e) {
    if (instanceNotValid(e)) {
      const remoteBridgeProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.RemoteBridgeProvier
      );

      return remoteBridgeProvider.call('request_remote_bridge', {
        dna_handle: socialTriangulationProvider.instance,
        zome_name: 'social-triangulation',
        cap_token: null,
        fn_name: 'fnName',
        fn_args: JSON.stringify(fnArgs),
      });
    } else throw new Error(e);
  }
}
