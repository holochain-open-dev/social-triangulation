import { LitElement } from 'lit-element';
import { ApolloClient } from 'apollo-boost';
import '@authentic/mwc-circular-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import { VouchedAgent } from '../types';
declare const STAgentList_base: {
    new (...args: any[]): import("@uprtcl/micro-orchestrator").ConnectedElement;
    prototype: any;
} & typeof LitElement;
export declare class STAgentList extends STAgentList_base {
    me: VouchedAgent | undefined;
    agents: VouchedAgent[] | undefined;
    minVouches: number;
    client: ApolloClient<any>;
    static get styles(): import("lit-element").CSSResult;
    firstUpdated(): Promise<void>;
    isAllowed(agent: VouchedAgent): boolean;
    vouchForAgent(agentId: string): void;
    renderAgent(agent: VouchedAgent): import("lit-element").TemplateResult;
    render(): import("lit-element").TemplateResult;
}
export {};
