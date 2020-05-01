export declare const resolvers: {
    Mutation: {
        vouchForAgent(_: any, { agentId }: {
            agentId: any;
        }, { container }: {
            container: any;
        }): Promise<any>;
    };
    Query: {
        minVouches(_: any, __: any, { container }: {
            container: any;
        }): Promise<string>;
    };
    Agent: {
        isInitialMember(parent: any, _: any, { container }: {
            container: any;
        }): Promise<boolean>;
        numVouches(parent: any, _: any, { container }: {
            container: any;
        }): Promise<number>;
    };
};
