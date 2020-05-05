(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@uprtcl/holochain-provider'), require('holochain-profiles'), require('@uprtcl/micro-orchestrator'), require('lit-element'), require('apollo-boost'), require('@uprtcl/graphql'), require('@authentic/mwc-circular-progress'), require('@material/mwc-list'), require('@material/mwc-list/mwc-list-item'), require('graphql-tag')) :
  typeof define === 'function' && define.amd ? define(['exports', '@uprtcl/holochain-provider', 'holochain-profiles', '@uprtcl/micro-orchestrator', 'lit-element', 'apollo-boost', '@uprtcl/graphql', '@authentic/mwc-circular-progress', '@material/mwc-list', '@material/mwc-list/mwc-list-item', 'graphql-tag'], factory) :
  (factory((global.hcSocialTriangulation = {}),global.holochainProvider,global.holochainProfiles,global.microOrchestrator,global.litElement,global.apolloBoost,global.graphql,null,null,null,global.gql));
}(this, (function (exports,holochainProvider,holochainProfiles,microOrchestrator,litElement,apolloBoost,graphql,mwcCircularProgress,mwcList,mwcListItem,gql) { 'use strict';

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
    vouchesCount: Int!
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
          async vouchesCount(parent, _, { container }) {
              const socialTriangulationProvider = container.get(SocialTriangulationBindings.SocialTriangulationBindings);
              const numVouches = await socialTriangulationProvider.call('vouch_count_for', {
                  agent_address: parent.id,
              });
              return parseInt(numVouches);
          },
      },
  };

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __decorate(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  function __metadata(metadataKey, metadataValue) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
  }

  const VOUCH_FOR_AGENT = gql `
  mutation VouchForAgent($agentId: ID!) {
    vouchForAgent(agentId: $agentId)
  }
`;

  class STAgentList extends microOrchestrator.moduleConnect(litElement.LitElement) {
      constructor() {
          super(...arguments);
          this.me = undefined;
          this.agents = undefined;
      }
      static get styles() {
          return litElement.css `
      .row {
        display: flex;
        flex-direction: row;
      }

      .fill {
        flex: 1;
      }

      .padding {
        padding: 16px;
      }

      .center-content {
        justify-content: center;
        align-items: center;
      }
    `;
      }
      async firstUpdated() {
          this.client = this.request(graphql.ApolloClientModule.bindings.Client);
          const result = await this.client.query({
              query: apolloBoost.gql `
        {
          me {
            id
            username
            vouchesCount
            isInitialMember
          }
          allAgents {
            id
            username
            vouchesCount
            isInitialMember
          }
          minVouches
        }
      `,
              fetchPolicy: 'network-only',
          });
          this.agents = result.data.allAgents;
          this.me = result.data.me;
          this.minVouches = result.data.minVouches;
      }
      isAllowed(agent) {
          return agent.isInitialMember || agent.vouchesCount >= this.minVouches;
      }
      vouchForAgent(agentId) {
          this.client.mutate({
              mutation: VOUCH_FOR_AGENT,
              variables: {
                  agentId,
              },
          });
      }
      renderAgent(agent) {
          return litElement.html `
      <div class="row" style="align-items: center;">
        <mwc-list-item style="flex: 1;" twoline noninteractive>
          <span>${agent.username}</span>
          <span slot="secondary">${agent.id}</span>
        </mwc-list-item>

        <span style="margin-right: 16px;">
          ${agent.isInitialMember
            ? 'Initial member'
            : `Vouch count: ${agent.vouchesCount}`}
        </span>
        ${this.isAllowed(this.me) && !this.isAllowed(agent)
            ? litElement.html `<mwc-button
              style="padding-right: 16px;"
              label="VOUCH"
              @click=${() => this.vouchForAgent(agent.id)}
            ></mwc-button>`
            : litElement.html ``}
      </div>
    `;
      }
      render() {
          if (!this.agents)
              return litElement.html `<div class="padding center-content row fill">
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;
          return litElement.html `
      <mwc-list>
        ${this.agents.map((agent, i) => litElement.html `${this.renderAgent(agent)}
          ${this.agents && i < this.agents.length - 1
            ? litElement.html `<li divider padded role="separator"></li> `
            : litElement.html ``} `)}
      </mwc-list>
    `;
      }
  }
  __decorate([
      litElement.property({ type: Array }),
      __metadata("design:type", Object)
  ], STAgentList.prototype, "me", void 0);
  __decorate([
      litElement.property({ type: Array }),
      __metadata("design:type", Object)
  ], STAgentList.prototype, "agents", void 0);
  __decorate([
      litElement.property({ type: Number }),
      __metadata("design:type", Number)
  ], STAgentList.prototype, "minVouches", void 0);

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
          customElements.define('hcst-agent-list', STAgentList);
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

  exports.SocialTriangulationModule = SocialTriangulationModule;
  exports.VOUCH_FOR_AGENT = VOUCH_FOR_AGENT;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=hc-social-triangulation.umd.js.map
