import { interfaces } from 'inversify';
import { GraphQlSchemaModule } from '@uprtcl/graphql';
import { MicroModule, i18nextModule } from '@uprtcl/micro-orchestrator';
import {
  HolochainConnectionModule,
  createHolochainProvider,
} from '@uprtcl/holochain-provider';
import { ProfilesModule } from 'holochain-profiles';

import en from './i18n/en.json';
import { SocialTriangulationBindings } from './bindings';
import { socialTriangulationTypeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { STAgentList } from './elements/hcst-agent-list';

export class SocialTriangulationModule extends MicroModule {
  static id = 'holochain-social-triangulation-module';

  dependencies = [HolochainConnectionModule.id, ProfilesModule.id];

  static bindings = SocialTriangulationBindings;

  constructor(protected instance: string, protected lobbyInstance: string) {
    super();
  }

  async onLoad(container: interfaces.Container) {
    const socialTriangulationProvider = createHolochainProvider(
      this.instance,
      'social-triangulation'
    );
    const lobbyProvider = createHolochainProvider(
      this.lobbyInstance,
      'remote-bridge'
    );

    container
      .bind(SocialTriangulationBindings.SocialTriangulationProvider)
      .to(socialTriangulationProvider);
    container
      .bind(SocialTriangulationBindings.RemoteBridgeProvier)
      .to(lobbyProvider);

    customElements.define('hcst-agent-list', STAgentList);
  }

  get submodules() {
    return [
      new GraphQlSchemaModule(socialTriangulationTypeDefs, resolvers),
      new i18nextModule('social-triangulation', { en: en }),
    ];
  }
}
