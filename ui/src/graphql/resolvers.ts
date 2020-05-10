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

      try {
        // Just seeing if we already have the social triangulation DNA installed
        await socialTriangulationProvider.call('get_setting', {});
      } catch (e) {
        if (instanceNotValid(e)) {
          const bridgeId: string = container.get(
            SocialTriangulationBindings.BridgeId
          );
          const dnaId: string = container.get(
            SocialTriangulationBindings.DnaId
          );
          const remoteBridgeProvider: HolochainProvider = container.get(
            SocialTriangulationBindings.RemoteBridgeProvier
          );

          const agentList = await connection.callAdmin('admin/agent/list', {});
          const agentName = agentList.find((a) => a.public_address === agentId);

          const interfaceList = await connection.callAdmin(
            'admin/interface/list',
            {}
          );
          const iface = interfaceList.find((i) =>
            i.instances.find(
              (instance) => instance.id === remoteBridgeProvider.instance
            )
          );

          const instanceResult = await connection.callAdmin(
            'admin/instance/add',
            {
              id: socialTriangulationProvider.instance,
              agent_id: agentName.id,
              dna_id: dnaId,
            }
          );
          const bridgeResult = await connection.callAdmin('admin/bridge/add', {
            handle: bridgeId,
            caller_id: remoteBridgeProvider.instance,
            callee_id: socialTriangulationProvider.instance,
          });

          connection.callAdmin('admin/interface/add_instance', {
            instance_id: socialTriangulationProvider.instance,
            interface_id: iface.id,
          });
          // Timeout because the add_instance call does not end
          await new Promise((resolve) => setTimeout(() => resolve(), 300));
          const startResult = await connection.callAdmin(
            'admin/instance/start',
            { id: socialTriangulationProvider.instance }
          );

          await volunteerToBridge(container);
        } else throw new Error(e);
      }
      await volunteerToBridge(container);

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
      if (settings === null) return null;

      return settings.split('Minimum_Required_Vouch:')[1];
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
      const settings: string = await localOrRemoteCall(
        container,
        'get_setting',
        {}
      );

      if (settings === null) return null;

      return settings.includes(parent.id);
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
