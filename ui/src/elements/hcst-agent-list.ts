import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { LitElement, html, property, css, query } from 'lit-element';
import { ApolloClient, gql } from 'apollo-boost';
import { ApolloClientModule } from '@uprtcl/graphql';

import '@authentic/mwc-circular-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import { VouchedAgent } from '../types';
import { VOUCH_FOR_AGENT } from '../graphql/queries';

export class STAgentList extends moduleConnect(LitElement) {

  @property({ type: Array })
  agents: VouchedAgent[] | undefined = undefined;

  @property({ type: Number })
  minVouches!: number;

  client!: ApolloClient<any>;

  static get styles() {
    return css`
      .row {
        display: flex;
        flex-direction: row;
      }
    `;
  }

  async firstUpdated() {
    this.client = this.request(ApolloClientModule.bindings.Client);

    const result = await this.client.query({
      query: gql`
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

  isAllowed(agent: VouchedAgent) {
    return agent.isInitialMember || agent.vouchesCount > this.minVouches;
  }

  vouchForAgent(agentId: string) {
    this.client.mutate({
      mutation: VOUCH_FOR_AGENT,
      variables: {
        agentId,
      },
    });
  }


  renderAgent(agent: VouchedAgent) {
    return html`
      <div class="row" style="align-items: center;">
        <mwc-list-item style="flex: 1;" twoline noninteractive>
          <span>${agent.username}</span>
          <span slot="secondary">${agent.id}</span>
        </mwc-list-item>

        <span style="margin-right: 8px;">${agent.vouchesCount}</span>
        ${this.isAllowed(agent)
          ? html``
          : html`
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
      return html`<mwc-circular-progress></mwc-circular-progress>`;

    return html`
      <mwc-list>
        ${this.agents.map(
          (agent, i) => html`${this.renderAgent(agent)}
          ${this.agents && i < this.agents.length - 1
            ? html`<li divider padded role="separator"></li> `
            : html``} `
        )}
      </mwc-list>
    `;
  }
}
