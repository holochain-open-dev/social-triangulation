import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { LitElement, html, property } from 'lit-element';
import { ApolloClient } from 'apollo-boost';
import { ApolloClientModule } from '@uprtcl/graphql';

import '@authentic/mwc-circular-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';

import { Agent } from '../types';
import { GET_ALL_AGENTS } from 'src/graphql/queries';

export class AgentList extends moduleConnect(LitElement) {
  @property({ type: Array })
  agents: Agent[] | undefined = undefined;

  client!: ApolloClient<any>;

  async firstUpdated() {
    this.client = this.request(ApolloClientModule.bindings.Client);

    const result = await this.client.query({
      query: GET_ALL_AGENTS,
    });

    this.agents = result.data.allAgents;
  }

  renderAgent(agent: Agent) {
    return html`<mwc-list-item>${agent.username}</mwc-list-item>`;
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
