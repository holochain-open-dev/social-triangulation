import { HolochainConnectionModule, createHolochainProvider } from '@uprtcl/holochain-provider';
import { ProfilesModule } from 'holochain-profiles';
import { moduleConnect, MicroModule, i18nextModule } from '@uprtcl/micro-orchestrator';
import { LitElement, html, property, css } from 'lit-element';
import { gql as gql$1 } from 'apollo-boost';
import { ApolloClientModule, GraphQlSchemaModule } from '@uprtcl/graphql';
import '@authentic/mwc-circular-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import gql from 'graphql-tag';

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

class STAgentList extends moduleConnect(LitElement) {
    constructor() {
        super(...arguments);
        this.agents = undefined;
    }
    static get styles() {
        return css `
      .row {
        display: flex;
        flex-direction: row;
      }
    `;
    }
    async firstUpdated() {
        this.client = this.request(ApolloClientModule.bindings.Client);
        const result = await this.client.query({
            query: gql$1 `
        {
          allAgents {
            id
            username
            vouchesCount
            isInitialMember
          }
          minVouches
        }
      `,
        });
        this.agents = result.data.allAgents;
        this.minVouches = result.data.minVouches;
    }
    isAllowed(agent) {
        return agent.isInitialMember || agent.vouchesCount > this.minVouches;
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
        return html `
      <div class="row" style="align-items: center;">
        <mwc-list-item style="flex: 1;" twoline noninteractive>
          <span>${agent.username}</span>
          <span slot="secondary">${agent.id}</span>
        </mwc-list-item>

        <span style="margin-right: 8px;">${agent.vouchesCount}</span>
        ${this.isAllowed(agent)
            ? html ``
            : html `
              <mwc-button
                label="VOUCH"
                @click=${() => this.vouchForAgent(agent.id)}
              ></mwc-button>
            `}
      </div>
    `;
    }
    render() {
        if (!this.agents)
            return html `<mwc-circular-progress></mwc-circular-progress>`;
        return html `
      <mwc-list>
        ${this.agents.map((agent, i) => html `${this.renderAgent(agent)}
          ${this.agents && i < this.agents.length - 1
            ? html `<li divider padded role="separator"></li> `
            : html ``} `)}
      </mwc-list>
    `;
    }
}
__decorate([
    property({ type: Array }),
    __metadata("design:type", Object)
], STAgentList.prototype, "agents", void 0);
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], STAgentList.prototype, "minVouches", void 0);

class SocialTriangulationModule extends MicroModule {
    constructor(instance) {
        super();
        this.instance = instance;
        this.dependencies = [HolochainConnectionModule.id, ProfilesModule.id];
    }
    async onLoad(container) {
        const socialTriangulationProvider = createHolochainProvider(this.instance, 'social-triangulation');
        container
            .bind(SocialTriangulationBindings.SocialTriangulationBindings)
            .to(socialTriangulationProvider);
        customElements.define('hcst-agent-list', STAgentList);
    }
    get submodules() {
        return [
            new GraphQlSchemaModule(socialTriangulationTypeDefs, resolvers),
            new i18nextModule('social-triangulation', { en: en }),
        ];
    }
}
SocialTriangulationModule.id = 'holochain-social-triangulation-module';
SocialTriangulationModule.bindings = SocialTriangulationBindings;

export { SocialTriangulationModule, VOUCH_FOR_AGENT };
//# sourceMappingURL=hc-social-triangulation.es5.js.map
