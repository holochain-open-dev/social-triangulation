import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { LitElement, html, property } from 'lit-element';
import { ApolloClient, gql } from 'apollo-boost';
import { ApolloClientModule } from '@uprtcl/graphql';
import { GET_ALL_AGENTS } from 'holochain-profiles';

import '@authentic/mwc-circular-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';

import { Agent } from '../types';
import { VOUCH_FOR_AGENT } from 'src/graphql/queries';

export class AgentList extends moduleConnect(LitElement) {
  @property({ type: Array })
  agents: Agent[] | undefined = undefined;

  client!: ApolloClient<any>;

  async firstUpdated() {
    this.client = this.request(ApolloClientModule.bindings.Client);

    const result = await this.client.query({
      query: gql`
        {
          allAgents {
            id
            username
            numVouches
          }
        }
      `,
    });

    this.agents = result.data.allAgents;
  }

  vouchForAgent(agentId: string) {
    this.client.mutate({
      mutation: VOUCH_FOR_AGENT,
      variables: {
        agentId,
      },
    });
  }

  renderAgent(agent: Agent) {
    return html`
      <mwc-list-item twoline hasMeta>
        <span>${agent.username}</span>
        <span slot="secondary">${agent.id}</span>

        <mwc-button
          slot="meta"
          label="VOUCH"
          @click=${() => this.vouchForAgent(agent.id)}
        ></mwc-button>
      </mwc-list-item>
      <li divider padded role="separator"></li>
    `;
  }

  render() {
    if (!this.agents)
      return html`<mwc-circular-progress></mwc-circular-progress>`;

    return html`
      <mwc-list>
        ${this.agents.map((agent) => this.renderAgent(agent))}
      </mwc-list>
    `;
  }
}
