import {
  HolochainProvider,
  HolochainConnectionModule,
  HolochainConnection,
} from '@uprtcl/holochain-provider';

import { SocialTriangulationBindings } from '../bindings';
import { Container } from 'inversify';
import { SocialTriangulationOptions } from '../types';

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
      const options: SocialTriangulationOptions = container.get(
        SocialTriangulationBindings.SocialTriangulationOptions
      );

      const bridgeId: string = container.get(
        SocialTriangulationBindings.BridgeId
      );
      const remoteBridgeProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.RemoteBridgeProvier
      );
      const agentConfig = await connection.getAgentConfig(agentId);

      await connection.cloneDna(
        agentConfig.id,
        options.dnaId,
        socialTriangulationProvider.instance,
        options.templateDnaAddress,
        options.properties
      );

      const bridgeResult = await connection.callAdmin('admin/bridge/add', {
        handle: bridgeId,
        caller_id: remoteBridgeProvider.instance,
        callee_id: socialTriangulationProvider.instance,
      });

      await volunteerToBridge(container);

      return true;
    },
  },
  Query: {
    async minVouches(_, __, { container }) {
      const options: SocialTriangulationOptions = container.get(
        SocialTriangulationBindings.SocialTriangulationOptions
      );
      return options.properties.necessary_vouches;
    },
  },
  Me: {
    async hasJoined(_, __, { container }) {
      const socialTriangulationProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.SocialTriangulationProvider
      );

      try {
        await socialTriangulationProvider.call('get_setting', {});
        return true;
      } catch (e) {
        if (instanceNotValid(e)) return false;
        else throw new Error(e);
      }
    },
  },
  Agent: {
    async isInitialMember(parent, _, { container }) {
      const options: SocialTriangulationOptions = container.get(
        SocialTriangulationBindings.SocialTriangulationOptions
      );
      return options.properties.initial_members.includes(parent.id);
    },
    async vouchesCount(parent, _, { container }) {
      const result = await localOrRemoteCall(container, 'vouch_count_for', {
        agent_address: parent.id,
      });

      if (result === null) return null;

      return parseInt(result);
    },
  },
};

export function instanceNotValid(error: Error): boolean {
  return error.message.includes(
    'instance identifier invalid: PublicInstanceIdentifier'
  );
}

export async function localOrRemoteCall(
  container: Container,
  fnName: string,
  fnArgs: any
): Promise<any> {
  const socialTriangulationProvider: HolochainProvider = container.get(
    SocialTriangulationBindings.SocialTriangulationProvider
  );

  try {
    const result = await socialTriangulationProvider.call(fnName, fnArgs);
    return result;
  } catch (e) {
    if (instanceNotValid(e)) {
      const remoteBridgeProvider: HolochainProvider = container.get(
        SocialTriangulationBindings.RemoteBridgeProvier
      );
      const bridgeId: string = container.get(
        SocialTriangulationBindings.BridgeId
      );

      try {
        const remoteResult = await remoteBridgeProvider.call(
          'request_remote_bridge',
          {
            bridge_id: bridgeId,
            zome_name: 'social-triangulation',
            cap_token: null,
            fn_name: fnName,
            fn_args: JSON.stringify(fnArgs),
          }
        );
        return remoteResult;
      } catch (e) {
        if (
          e.message &&
          e.message.includes('Could not invoke the remote bridge from any node')
        ) {
          return null;
        } else throw new Error(e);
      }
    } else throw new Error(e);
  }
}

async function volunteerToBridge(container: Container) {
  const bridgeId: string = container.get(SocialTriangulationBindings.BridgeId);

  const remoteBridgeProvider: HolochainProvider = container.get(
    SocialTriangulationBindings.RemoteBridgeProvier
  );

  return remoteBridgeProvider.call('volunteer_to_bridge', {
    bridge_id: bridgeId,
  });
}
