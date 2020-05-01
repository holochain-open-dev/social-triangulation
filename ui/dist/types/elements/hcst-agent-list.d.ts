import { LitElement } from 'lit-element';
import { ApolloClient } from 'apollo-boost';
import '@authentic/mwc-circular-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import { Agent } from '../types';
declare const AgentList_base: {
    new (...args: any[]): import("@uprtcl/micro-orchestrator").ConnectedElement;
    prototype: any;
} & typeof LitElement;
export declare class AgentList extends AgentList_base {
    agents: Agent[] | undefined;
    client: ApolloClient<any>;
    firstUpdated(): Promise<void>;
    renderAgent(agent: Agent): import("lit-element").TemplateResult;
    render(): import("lit-element").TemplateResult;
}
export {};
