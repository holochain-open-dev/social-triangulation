import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { LitElement, html, property, css, query } from 'lit-element';
import { ApolloClient, gql } from 'apollo-boost';
import { ApolloClientModule } from '@uprtcl/graphql';

import '@authentic/mwc-circular-progress';
import '@material/mwc-list';
import { Dialog } from '@material/mwc-dialog';
import '@material/mwc-list/mwc-list-item';
import { VouchedAgent } from '../types';
import { VOUCH_FOR_AGENT, GET_ALL_VOUCHED_AGENTS } from '../graphql/queries';

export class STAgentList extends moduleConnect(LitElement) {
  @property({ type: Array })
  meHasJoined!: boolean;

  @property({ type: Array })
  agents: Array<VouchedAgent & { vouching?: boolean }> | undefined = undefined;

  @property({ type: Number })
  minVouches!: number;

  @property({ type: String })
  agentFilter: 'all-agents' | 'only-not-joined' | 'only-joined' = 'all-agents';

  @property({ type: Object })
  selectedAgent: VouchedAgent | undefined = undefined;

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
            hasJoined
          }
          minVouches
        }
      `,
      fetchPolicy: 'network-only',
    });
    this.meHasJoined = result.data.me.hasJoined;
    this.minVouches = result.data.minVouches;

    this.client
      .watchQuery({
        query: GET_ALL_VOUCHED_AGENTS,
        fetchPolicy: 'network-only',
      })
      .subscribe((result) => {
        this.agents = result.data.allAgents;
      });
  }

  hasJoined(agent: VouchedAgent) {
    return agent.isInitialMember || agent.vouchesCount >= this.minVouches;
  }

  async vouchForAgent(agent: VouchedAgent) {
    this.selectedAgent = undefined;
    const agents = this.agents as VouchedAgent[];
    const agentFound = agents.find((a) => a.id === agent.id) as VouchedAgent & {
      vouching?: boolean;
    };
    agentFound.vouching = true;

    this.agents = [...agents];

    await this.client.mutate({
      mutation: VOUCH_FOR_AGENT,
      variables: {
        agentId: agent.id,
      },
      update: (cache, result) => {
        const data: any = cache.readQuery({
          query: GET_ALL_VOUCHED_AGENTS,
        });

        const agentIndex = data.allAgents.findIndex((a) => a.id === agent.id);

        data.allAgents[agentIndex].vouchesCount++;

        cache.writeQuery({
          query: GET_ALL_VOUCHED_AGENTS,
          data,
        });
      },
    });

    this.dispatchEvent(
      new CustomEvent('vouched-for-agent', {
        detail: { agent },
        bubbles: true,
        composed: true,
      })
    );

    agentFound.vouching = false;

    this.agents = [...agents];
  }

  getAgents(): VouchedAgent[] {
    const agents = this.agents as VouchedAgent[];
    if (this.agentFilter === 'all-agents') return agents;
    else if (this.agentFilter === 'only-joined')
      return agents.filter((a) => this.hasJoined(a));
    else return agents.filter((a) => !this.hasJoined(a));
  }

  renderAgentAction(agent: VouchedAgent & { vouching?: boolean }) {
    if (agent.vouching)
      return html`<mwc-circular-progress></mwc-circular-progress>`;
    else if (!this.hasJoined(agent) && this.meHasJoined)
      return html`<mwc-button
        style="padding-right: 16px;"
        label="VOUCH"
        outlined
        @click=${() => {
          this.selectedAgent = agent;

          ((this.shadowRoot as any).getElementById(
            'confirm-dialog'
          ) as Dialog).open = true;
        }}
      ></mwc-button>`;
    return html``;
  }

  renderConfirmVouch() {
    return html`
      <mwc-dialog id="confirm-dialog" heading="Confirm vouch">
        <span>
          Are you sure you want to vouch for
          @${this.selectedAgent
            ? (this.selectedAgent as VouchedAgent).username
            : ''}
          to be able to join the network?
        </span>
        <mwc-button slot="secondaryAction" dialogAction="cancel">
          Cancel
        </mwc-button>
        <mwc-button
          slot="primaryAction"
          @click=${() => this.vouchForAgent(this.selectedAgent as VouchedAgent)}
          dialogAction="create"
        >
          Confirm
        </mwc-button>
      </mwc-dialog>
    `;
  }

  renderAgent(agent: VouchedAgent) {
    return html`
      <div class="row" style="align-items: center;">
        <mwc-list-item style="flex: 1;" twoline noninteractive graphic="avatar">
          <span>@${agent.username}</span>
          <span slot="secondary">${agent.id}</span>
          <mwc-icon slot="graphic">emoji_people</mwc-icon>
        </mwc-list-item>

        <span style="margin-right: 16px;">
          ${agent.isInitialMember
            ? 'Initial member'
            : `${agent.vouchesCount} vouches`}
        </span>
        ${this.renderAgentAction(agent)}
      </div>
    `;
  }

  getEmptyPlaceholder() {
    if (this.agentFilter === 'all-agents')
      return 'There are no registered agents in this network';
    else if (this.agentFilter === 'only-joined')
      return 'There are no registered agents who have joined this network';
    else
      return 'There are no registered agents who have not joined this network yet';
  }

  render() {
    if (!this.agents)
      return html`<div class="padding center-content row fill">
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    const agents = this.getAgents();

    if (agents.length === 0)
      return html`<div class="padding center-content row fill">
        <span style="opacity: 0.7;">${this.getEmptyPlaceholder()}</span>
      </div>`;

    return html`
      ${this.renderConfirmVouch()}
      <mwc-list>
        ${agents.map(
          (agent, i) => html`${this.renderAgent(agent)}
          ${i < agents.length - 1
            ? html`<li divider padded role="separator"></li> `
            : html``} `
        )}
      </mwc-list>
    `;
  }
}
