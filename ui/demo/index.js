import {
  MicroOrchestrator,
  i18nextBaseModule,
} from '@uprtcl/micro-orchestrator';
import { ApolloClientModule } from '@uprtcl/graphql';
import { ProfilesModule } from '../dist/hc-profiles.es5';
import {
  HolochainConnectionModule,
  HolochainConnection,
} from '@uprtcl/holochain-provider';

(async function () {
  const connection = new HolochainConnection({ host: 'ws://localhost:8888' });

  const hcConnectionModule = new HolochainConnectionModule(connection);

  const profiles = new ProfilesModule('test-instance');

  const orchestrator = new MicroOrchestrator();
  await orchestrator.loadModules([
    new i18nextBaseModule(),
    new ApolloClientModule(),
    hcConnectionModule,
    profiles,
  ]);
})();
