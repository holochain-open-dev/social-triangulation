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
  me: VouchedAgent | undefined = undefined;

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
    this.client = this.request(ApolloClientModule.bindings.Client);

    const result = await this.client.query({
      query: gql`
        {
          me {
            id
            agent {
              id
              username
              vouchesCount
              isInitialMember
            }
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

  isAllowed(agent: VouchedAgent) {
    return agent.isInitialMember || agent.vouchesCount >= this.minVouches;
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

        <span style="margin-right: 16px;">
          ${agent.isInitialMember
            ? 'Initial member'
            : `Vouch count: ${agent.vouchesCount}`}
        </span>
        ${this.isAllowed(this.me as VouchedAgent) && !this.isAllowed(agent)
          ? html`<mwc-button
              style="padding-right: 16px;"
              label="VOUCH"
              @click=${() => this.vouchForAgent(agent.id)}
            ></mwc-button>`
          : html``}
      </div>
    `;
  }

  render() {
    if (!this.agents)
      return html`<div class="padding center-content row fill">
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    if (this.agents.length === 0)
      return html`<span>There are no registered agents in this network</span>`;

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
