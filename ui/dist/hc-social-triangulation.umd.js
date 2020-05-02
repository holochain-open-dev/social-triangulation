(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@uprtcl/graphql'), require('@uprtcl/micro-orchestrator'), require('@uprtcl/holochain-provider'), require('holochain-profiles'), require('graphql-tag')) :
  typeof define === 'function' && define.amd ? define(['exports', '@uprtcl/graphql', '@uprtcl/micro-orchestrator', '@uprtcl/holochain-provider', 'holochain-profiles', 'graphql-tag'], factory) :
  (factory((global.hcSocialTriangulation = {}),global.graphql,global.microOrchestrator,global.holochainProvider,global.holochainProfiles,global.gql));
}(this, (function (exports,graphql,microOrchestrator,holochainProvider,holochainProfiles,gql) { 'use strict';

  gql = gql && gql.hasOwnProperty('default') ? gql['default'] : gql;

  var en = {
  	
  };

  const SocialTriangulationBindings = {
      SocialTriangulationBindings: "holochain-social-triangulation-provider"
  };

  const socialTriangulationTypeDefs = gql `
  extend type Mutation {
    vouchForAgent(agentId: ID!): Boolean!
  }

  extend type Agent {
    numVouches: Int!
    isInitialMember: Boolean!
  }

  extend type Query {
    minVouches: Int!
  }
`;

  const resolvers = {
      Mutation: {
          async vouchForAgent(_, { agentId }, { container }) {
              const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
              await socialTriangulationProvider.call('vouch_for', {
                  agent_address: agentId,
              });
              return true;
          },
      },
      Query: {
          async minVouches(_, __, { container }) {
              const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
              const settings = await socialTriangulationProvider.call('get_setting', {});
              return settings.split('Minimum_Required_Vouch:')[1];
          },
      },
      Agent: {
          async isInitialMember(parent, _, { container }) {
              const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
              const settings = await socialTriangulationProvider.call('get_setting', {});
              return settings.includes(parent.id);
          },
          async numVouches(parent, _, { container }) {
              const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
              const numVouches = await socialTriangulationProvider.call('vouch_count_for', {
                  agent_address: parent.id,
              });
              return parseInt(numVouches);
          },
      },
  };

  class SocialTriangulationModule extends microOrchestrator.MicroModule {
      constructor(instance) {
          super();
          this.instance = instance;
          this.dependencies = [holochainProvider.HolochainConnectionModule.id, holochainProfiles.ProfilesModule.id];
      }
      async onLoad(container) {
          const socialTriangulationProvider = holochainProvider.createHolochainProvider(this.instance, 'social-triangulation');
          container
              .bind(SocialTriangulationBindings.SocialTriangulationBindings)
              .to(socialTriangulationProvider);
      }
      get submodules() {
          return [
              new graphql.GraphQlSchemaModule(socialTriangulationTypeDefs, resolvers),
              new microOrchestrator.i18nextModule('social-triangulation', { en: en }),
          ];
      }
  }
  SocialTriangulationModule.id = 'holochain-social-triangulation-module';
  SocialTriangulationModule.bindings = SocialTriangulationBindings;

  const VOUCH_FOR_AGENT = gql `
  mutation VouchForAgent($agentId: ID!) {
    vouchForAgent(agentId: $agentId)
  }
`;

  exports.SocialTriangulationModule = SocialTriangulationModule;
  exports.VOUCH_FOR_AGENT = VOUCH_FOR_AGENT;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=hc-social-triangulation.umd.js.map
