import { Container } from 'inversify';
export declare const resolvers: {
    Mutation: {
        vouchForAgent(_: any, { agentId }: {
            agentId: any;
        }, { container }: {
            container: any;
        }): Promise<boolean>;
        joinNetwork(_: any, { agentId }: {
            agentId: any;
        }, { container }: {
            container: any;
        }): Promise<boolean>;
    };
    Query: {
        minVouches(_: any, __: any, { container }: {
            container: any;
        }): Promise<string>;
    };
    Me: {
        hasJoined(_: any, __: any, { container }: {
            container: any;
        }): Promise<boolean>;
    };
    Agent: {
        isInitialMember(parent: any, _: any, { container }: {
            container: any;
        }): Promise<boolean>;
        vouchesCount(parent: any, _: any, { container }: {
            container: any;
        }): Promise<number>;
    };
};
export declare function instanceNotValid(error: Error): boolean;
export declare function localOrRemoteCall(container: Container, fnName: string, fnArgs: any): Promise<any>;
